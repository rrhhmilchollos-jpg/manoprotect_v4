"""
ManoProtect - WebSocket Manager for Real-time SOS Alerts
Handles real-time communication between users and their family members
"""
import socketio
from datetime import datetime, timezone
import json

# Create Socket.IO server with CORS
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=False,
    engineio_logger=False
)

# Store active connections: {user_id: [sid1, sid2, ...]}
active_connections = {}
# Store user info: {sid: {user_id, user_name, ...}}
connection_info = {}
# Store active SOS alerts: {alert_id: {user_id, location, timestamp, ...}}
active_sos_alerts = {}

# Database reference (set during initialization)
_db = None

def init_websocket(db):
    """Initialize WebSocket with database connection"""
    global _db
    _db = db
    print("✅ WebSocket manager initialized")

@sio.event
async def connect(sid, environ, auth):
    """Handle new WebSocket connection"""
    print(f"[WS] Client connected: {sid}")
    return True

@sio.event
async def disconnect(sid):
    """Handle WebSocket disconnection"""
    print(f"[WS] Client disconnected: {sid}")
    
    # Remove from active connections
    if sid in connection_info:
        user_id = connection_info[sid].get('user_id')
        if user_id and user_id in active_connections:
            active_connections[user_id] = [s for s in active_connections[user_id] if s != sid]
            if not active_connections[user_id]:
                del active_connections[user_id]
        del connection_info[sid]

@sio.event
async def register(sid, data):
    """Register user for real-time updates"""
    user_id = data.get('user_id')
    user_name = data.get('user_name', 'Usuario')
    
    if not user_id:
        await sio.emit('error', {'message': 'user_id required'}, to=sid)
        return
    
    # Store connection
    if user_id not in active_connections:
        active_connections[user_id] = []
    active_connections[user_id].append(sid)
    
    connection_info[sid] = {
        'user_id': user_id,
        'user_name': user_name,
        'connected_at': datetime.now(timezone.utc).isoformat()
    }
    
    print(f"[WS] User registered: {user_id} ({user_name})")
    
    # Send confirmation
    await sio.emit('registered', {
        'status': 'connected',
        'user_id': user_id,
        'timestamp': datetime.now(timezone.utc).isoformat()
    }, to=sid)
    
    # Check for active SOS alerts for this user's family
    await check_family_alerts(sid, user_id)

async def check_family_alerts(sid, user_id):
    """Check if there are active SOS alerts for user's family"""
    if not _db:
        return
    
    # Get family members where this user is a contact
    family_alerts = await _db.sos_alerts.find({
        'status': 'active'
    }, {'_id': 0}).to_list(10)
    
    for alert in family_alerts:
        # Check if this user should receive the alert
        alert_user_id = alert.get('user_id')
        
        # Check if user is a family member
        is_family = await _db.family_members.find_one({
            'family_owner_id': alert_user_id,
            '$or': [{'user_id': user_id}]
        })
        
        if is_family:
            await sio.emit('sos_alert', {
                'type': 'active_alert',
                'alert': alert
            }, to=sid)

@sio.event
async def sos_activate(sid, data):
    """Handle SOS activation from user"""
    if sid not in connection_info:
        await sio.emit('error', {'message': 'Not registered'}, to=sid)
        return
    
    user_id = connection_info[sid]['user_id']
    user_name = connection_info[sid].get('user_name', 'Usuario')
    
    alert_id = data.get('alert_id', f"sos_{datetime.now().strftime('%Y%m%d%H%M%S')}")
    location = data.get('location', {})
    message = data.get('message', '¡Emergencia!')
    
    # Store active alert
    alert_data = {
        'alert_id': alert_id,
        'user_id': user_id,
        'user_name': user_name,
        'location': location,
        'message': message,
        'status': 'active',
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    active_sos_alerts[alert_id] = alert_data
    
    print(f"[WS] SOS Activated by {user_name} ({user_id})")
    
    # Notify all family members in real-time
    await notify_family_sos(user_id, alert_data)
    
    # Confirm to sender
    await sio.emit('sos_confirmed', {
        'alert_id': alert_id,
        'status': 'sent',
        'timestamp': datetime.now(timezone.utc).isoformat()
    }, to=sid)

async def notify_family_sos(user_id, alert_data):
    """Send SOS alert to all family members via WebSocket"""
    if not _db:
        return
    
    # Get family members
    family_members = await _db.family_members.find(
        {'family_owner_id': user_id, 'emergency_contact': True},
        {'_id': 0}
    ).to_list(20)
    
    # Get trusted contacts
    trusted_contacts = await _db.trusted_contacts.find(
        {'user_id': user_id},
        {'_id': 0}
    ).to_list(20)
    
    all_contacts = family_members + trusted_contacts
    notified_count = 0
    
    for contact in all_contacts:
        contact_user_id = contact.get('user_id') or contact.get('contact_id')
        
        if contact_user_id and contact_user_id in active_connections:
            for sid in active_connections[contact_user_id]:
                await sio.emit('sos_alert', {
                    'type': 'new_alert',
                    'alert': alert_data,
                    'action_required': True,
                    'play_siren': True
                }, to=sid)
                notified_count += 1
                print(f"[WS] SOS sent to {contact_user_id}")
    
    return notified_count

@sio.event
async def sos_deactivate(sid, data):
    """Handle SOS deactivation"""
    if sid not in connection_info:
        return
    
    user_id = connection_info[sid]['user_id']
    alert_id = data.get('alert_id')
    
    if alert_id and alert_id in active_sos_alerts:
        active_sos_alerts[alert_id]['status'] = 'resolved'
        
        # Notify family that SOS is resolved
        await notify_family_sos_resolved(user_id, alert_id)
    
    await sio.emit('sos_deactivated', {
        'alert_id': alert_id,
        'status': 'resolved'
    }, to=sid)

async def notify_family_sos_resolved(user_id, alert_id):
    """Notify family that SOS has been resolved"""
    if not _db:
        return
    
    family_members = await _db.family_members.find(
        {'family_owner_id': user_id},
        {'_id': 0}
    ).to_list(20)
    
    for member in family_members:
        member_user_id = member.get('user_id')
        if member_user_id and member_user_id in active_connections:
            for sid in active_connections[member_user_id]:
                await sio.emit('sos_resolved', {
                    'alert_id': alert_id,
                    'status': 'resolved',
                    'timestamp': datetime.now(timezone.utc).isoformat()
                }, to=sid)

@sio.event
async def location_update(sid, data):
    """Handle location update during active SOS"""
    if sid not in connection_info:
        return
    
    user_id = connection_info[sid]['user_id']
    location = data.get('location', {})
    alert_id = data.get('alert_id')
    
    # Update location in active alert
    if alert_id and alert_id in active_sos_alerts:
        active_sos_alerts[alert_id]['location'] = location
        active_sos_alerts[alert_id]['location_updated'] = datetime.now(timezone.utc).isoformat()
    
    # Broadcast location to family
    await broadcast_location_to_family(user_id, location, alert_id)

async def broadcast_location_to_family(user_id, location, alert_id=None):
    """Broadcast user's location to their family members"""
    if not _db:
        return
    
    family_members = await _db.family_members.find(
        {'family_owner_id': user_id},
        {'_id': 0}
    ).to_list(20)
    
    for member in family_members:
        member_user_id = member.get('user_id')
        if member_user_id and member_user_id in active_connections:
            for sid in active_connections[member_user_id]:
                await sio.emit('location_update', {
                    'user_id': user_id,
                    'alert_id': alert_id,
                    'location': location,
                    'timestamp': datetime.now(timezone.utc).isoformat()
                }, to=sid)

@sio.event
async def acknowledge_sos(sid, data):
    """Handle SOS acknowledgment from family member"""
    if sid not in connection_info:
        return
    
    acknowledger_id = connection_info[sid]['user_id']
    acknowledger_name = connection_info[sid].get('user_name', 'Familiar')
    alert_id = data.get('alert_id')
    
    if alert_id and alert_id in active_sos_alerts:
        alert = active_sos_alerts[alert_id]
        sender_user_id = alert.get('user_id')
        
        # Notify the SOS sender that help is coming
        if sender_user_id and sender_user_id in active_connections:
            for sender_sid in active_connections[sender_user_id]:
                await sio.emit('sos_acknowledged', {
                    'alert_id': alert_id,
                    'acknowledged_by': acknowledger_name,
                    'timestamp': datetime.now(timezone.utc).isoformat()
                }, to=sender_sid)

# Utility function to send SOS from API routes
async def send_sos_to_family(user_id: str, user_name: str, alert_data: dict):
    """Called from API routes to send SOS via WebSocket"""
    alert_data['user_id'] = user_id
    alert_data['user_name'] = user_name
    
    # Store in active alerts
    alert_id = alert_data.get('alert_id')
    if alert_id:
        active_sos_alerts[alert_id] = alert_data
    
    # Notify family
    return await notify_family_sos(user_id, alert_data)

# Get Socket.IO ASGI app
def get_socketio_app():
    """Return ASGI app for Socket.IO"""
    return socketio.ASGIApp(sio)
