"""
ManoProtect - MongoDB Index Setup
Run this script to create all necessary indexes for optimal performance

Usage:
    python scripts/create_indexes.py
    
Or from the backend directory:
    python -m scripts.create_indexes
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()


async def create_indexes():
    """Create all MongoDB indexes for ManoProtect"""
    
    mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.environ.get("DB_NAME", "manoprotect")
    
    print(f"🔗 Connecting to MongoDB: {mongo_url}")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print(f"📦 Database: {db_name}")
    print("🔧 Creating indexes...\n")
    
    # =============================================
    # Users Collection
    # =============================================
    print("📌 users collection:")
    await db.users.create_index("user_id", unique=True)
    print("   ✅ user_id (unique)")
    await db.users.create_index("email", unique=True)
    print("   ✅ email (unique)")
    await db.users.create_index("plan")
    print("   ✅ plan")
    await db.users.create_index("created_at")
    print("   ✅ created_at")
    
    # =============================================
    # User Sessions Collection
    # =============================================
    print("\n📌 user_sessions collection:")
    await db.user_sessions.create_index("session_token", unique=True)
    print("   ✅ session_token (unique)")
    await db.user_sessions.create_index("user_id")
    print("   ✅ user_id")
    await db.user_sessions.create_index("expires_at", expireAfterSeconds=0)
    print("   ✅ expires_at (TTL index)")
    
    # =============================================
    # Geofences Collection
    # =============================================
    print("\n📌 geofences collection:")
    await db.geofences.create_index("geofence_id", unique=True)
    print("   ✅ geofence_id (unique)")
    await db.geofences.create_index("user_id")
    print("   ✅ user_id")
    await db.geofences.create_index([("latitude", 1), ("longitude", 1)])
    print("   ✅ latitude + longitude (compound)")
    await db.geofences.create_index("is_active")
    print("   ✅ is_active")
    
    # =============================================
    # Geofence Events Collection
    # =============================================
    print("\n📌 geofence_events collection:")
    await db.geofence_events.create_index("geofence_id")
    print("   ✅ geofence_id")
    await db.geofence_events.create_index("member_id")
    print("   ✅ member_id")
    await db.geofence_events.create_index("created_at")
    print("   ✅ created_at")
    await db.geofence_events.create_index("event_type")
    print("   ✅ event_type")
    
    # =============================================
    # Family Children Collection
    # =============================================
    print("\n📌 family_children collection:")
    await db.family_children.create_index("child_id", unique=True)
    print("   ✅ child_id (unique)")
    await db.family_children.create_index("user_id")
    print("   ✅ user_id")
    await db.family_children.create_index("phone")
    print("   ✅ phone")
    
    # =============================================
    # SOS Alerts Collection
    # =============================================
    print("\n📌 sos_alerts collection:")
    await db.sos_alerts.create_index("alert_id", unique=True)
    print("   ✅ alert_id (unique)")
    await db.sos_alerts.create_index("user_id")
    print("   ✅ user_id")
    await db.sos_alerts.create_index("created_at")
    print("   ✅ created_at")
    await db.sos_alerts.create_index("status")
    print("   ✅ status")
    
    # =============================================
    # Notifications Collection
    # =============================================
    print("\n📌 notifications collection:")
    await db.notifications.create_index("user_id")
    print("   ✅ user_id")
    await db.notifications.create_index("is_read")
    print("   ✅ is_read")
    await db.notifications.create_index([("user_id", 1), ("created_at", -1)])
    print("   ✅ user_id + created_at (compound)")
    
    # =============================================
    # Push Subscriptions Collection
    # =============================================
    print("\n📌 push_subscriptions collection:")
    await db.push_subscriptions.create_index("user_id")
    print("   ✅ user_id")
    await db.push_subscriptions.create_index("fcm_token")
    print("   ✅ fcm_token")
    await db.push_subscriptions.create_index([("user_id", 1), ("endpoint", 1)], unique=True)
    print("   ✅ user_id + endpoint (unique compound)")
    
    # =============================================
    # Threats Collection
    # =============================================
    print("\n📌 threats collection:")
    await db.threats.create_index("user_id")
    print("   ✅ user_id")
    await db.threats.create_index("is_threat")
    print("   ✅ is_threat")
    await db.threats.create_index("threat_type")
    print("   ✅ threat_type")
    await db.threats.create_index("created_at")
    print("   ✅ created_at")
    
    # =============================================
    # Chat History Collection
    # =============================================
    print("\n📌 chat_history collection:")
    await db.chat_history.create_index("session_id")
    print("   ✅ session_id")
    await db.chat_history.create_index("created_at")
    print("   ✅ created_at")
    
    # =============================================
    # Payment Transactions Collection
    # =============================================
    print("\n📌 payment_transactions collection:")
    await db.payment_transactions.create_index("user_id")
    print("   ✅ user_id")
    await db.payment_transactions.create_index("stripe_session_id")
    print("   ✅ stripe_session_id")
    await db.payment_transactions.create_index("status")
    print("   ✅ status")
    
    # =============================================
    # API Keys Collection
    # =============================================
    print("\n📌 api_keys collection:")
    await db.api_keys.create_index("key_id", unique=True)
    print("   ✅ key_id (unique)")
    await db.api_keys.create_index("user_id")
    print("   ✅ user_id")
    await db.api_keys.create_index("is_active")
    print("   ✅ is_active")
    
    # Summary
    print("\n" + "="*50)
    print("✅ All indexes created successfully!")
    print("="*50)
    
    # List all indexes
    collections = await db.list_collection_names()
    total_indexes = 0
    for coll_name in collections:
        indexes = await db[coll_name].index_information()
        total_indexes += len(indexes)
    
    print(f"\n📊 Summary:")
    print(f"   Collections: {len(collections)}")
    print(f"   Total indexes: {total_indexes}")
    
    client.close()
    print("\n🔒 Connection closed")


if __name__ == "__main__":
    asyncio.run(create_indexes())
