"""
ManoProtect - Cron Jobs Scheduler
Automatic background tasks for subscription management
"""
import asyncio
import os
from datetime import datetime, timezone, timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
import httpx
from motor.motor_asyncio import AsyncIOMotorClient

# API URL for internal calls
API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:8001/api")

# Database connection for direct access
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "manoprotect")

scheduler = AsyncIOScheduler()

async def get_db():
    """Get database connection"""
    client = AsyncIOMotorClient(MONGO_URL)
    return client[DB_NAME]

async def process_expired_trials():
    """Process expired trials - runs every hour"""
    print(f"[CRON] Processing expired trials at {datetime.now(timezone.utc).isoformat()}")
    
    try:
        async with httpx.AsyncClient() as client:
            # Old subscription manager endpoint
            response = await client.post(
                f"{API_BASE_URL}/subscription-manager/process-expired-trials",
                timeout=60.0
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"[CRON] Expired trials processed (old system): {result}")
            else:
                print(f"[CRON] Error processing trials (old): {response.status_code}")
            
            # New subscription system endpoint
            response2 = await client.post(
                f"{API_BASE_URL}/subscriptions/cron/revisar-trials",
                timeout=60.0
            )
            
            if response2.status_code == 200:
                result2 = response2.json()
                print(f"[CRON] Trials reviewed (new system): {result2.get('resultados', {})}")
            else:
                print(f"[CRON] Error reviewing trials (new): {response2.status_code}")
                
    except Exception as e:
        print(f"[CRON] Exception processing trials: {e}")

async def send_trial_reminders():
    """Send reminders to users whose trial is expiring in 2 days - runs daily at 9 AM"""
    print(f"[CRON] Sending trial reminders at {datetime.now(timezone.utc).isoformat()}")
    
    try:
        from services.email_service import EmailNotificationService
        
        db = await get_db()
        email_service = EmailNotificationService()
        
        # Find users with trials expiring in 2 days
        now = datetime.now(timezone.utc)
        two_days_from_now = now + timedelta(days=2)
        three_days_from_now = now + timedelta(days=3)
        
        # Find users whose trial ends between 2-3 days from now
        users_expiring = await db.users.find({
            "estado": "trial_active",
            "trial_end": {
                "$gte": two_days_from_now.isoformat(),
                "$lt": three_days_from_now.isoformat()
            }
        }, {"_id": 0}).to_list(1000)
        
        print(f"[CRON] Found {len(users_expiring)} users with trials expiring in ~2 days")
        
        reminders_sent = 0
        for user in users_expiring:
            try:
                # Calculate days left
                trial_end = datetime.fromisoformat(user.get("trial_end", "").replace("Z", "+00:00"))
                days_left = (trial_end - now).days
                
                # Get plan info
                plan_type = user.get("plan_type", "individual")
                periodo = user.get("plan_period", "mensual")
                
                plan_prices = {
                    "basico": {"mensual": 0, "anual": 0},
                    "individual": {"mensual": 29.99, "anual": 249.99},
                    "familiar": {"mensual": 49.99, "anual": 399.99}
                }
                
                plan_names = {
                    "basico": "Plan Básico",
                    "basic_trial": "Plan Básico",
                    "individual": "Plan Individual",
                    "familiar": "Plan Familiar"
                }
                
                price = plan_prices.get(plan_type, {}).get(periodo, 29.99)
                plan_name = plan_names.get(plan_type, "Premium")
                
                # Send reminder email
                await email_service.send_trial_ending_soon_email(
                    user_id=user.get("user_id", ""),
                    email=user.get("email", ""),
                    trial_data={
                        "days_left": days_left,
                        "trial_end": trial_end.strftime("%d/%m/%Y"),
                        "plan_name": f"{plan_name} {periodo.capitalize()}",
                        "plan_price": f"{price:.2f}",
                        "nombre": user.get("nombre", user.get("name", ""))
                    }
                )
                
                reminders_sent += 1
                print(f"[CRON] Reminder sent to: {user.get('email')}")
                
            except Exception as e:
                print(f"[CRON] Error sending reminder to {user.get('email')}: {e}")
        
        print(f"[CRON] Trial reminders completed: {reminders_sent} sent")
        
    except Exception as e:
        print(f"[CRON] Exception sending trial reminders: {e}")

async def cleanup_old_sessions():
    """Clean up old expired sessions - runs daily at 3 AM"""
    print(f"[CRON] Cleaning up old sessions at {datetime.now(timezone.utc).isoformat()}")
    
    try:
        db = await get_db()
        
        # Delete sessions older than 30 days
        cutoff = datetime.now(timezone.utc) - timedelta(days=30)
        
        result = await db.user_sessions.delete_many({
            "created_at": {"$lt": cutoff.isoformat()}
        })
        
        print(f"[CRON] Cleaned up {result.deleted_count} old sessions")
        
    except Exception as e:
        print(f"[CRON] Exception cleaning sessions: {e}")

async def process_email_sequences():
    """Process pending CRO email sequences - runs every 2 hours"""
    print(f"[CRON] Processing email sequences at {datetime.now(timezone.utc).isoformat()}")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{API_BASE_URL}/cro/email-sequence/process",
                timeout=30.0
            )
            if response.status_code == 200:
                result = response.json()
                print(f"[CRON] Email sequences processed: {result.get('processed', 0)} emails")
            else:
                print(f"[CRON] Error processing email sequences: {response.status_code}")
    except Exception as e:
        print(f"[CRON] Exception processing email sequences: {e}")

def start_scheduler():
    """Start the scheduler with all cron jobs"""
    # Process expired trials every hour
    scheduler.add_job(
        process_expired_trials,
        IntervalTrigger(hours=1),
        id='process_expired_trials',
        name='Process Expired Trials',
        replace_existing=True
    )
    
    # Send trial reminders daily at 9 AM UTC
    scheduler.add_job(
        send_trial_reminders,
        CronTrigger(hour=9, minute=0),
        id='send_trial_reminders',
        name='Send Trial Reminders',
        replace_existing=True
    )
    
    # Process CRO email sequences every 2 hours
    scheduler.add_job(
        process_email_sequences,
        IntervalTrigger(hours=2),
        id='process_email_sequences',
        name='Process CRO Email Sequences',
        replace_existing=True
    )
    
    # Cleanup old sessions daily at 3 AM UTC
    scheduler.add_job(
        cleanup_old_sessions,
        CronTrigger(hour=3, minute=0),
        id='cleanup_old_sessions',
        name='Cleanup Old Sessions',
        replace_existing=True
    )
    
    scheduler.start()
    print("[CRON] Scheduler started with the following jobs:")
    for job in scheduler.get_jobs():
        print(f"  - {job.name}: {job.trigger}")

def stop_scheduler():
    """Stop the scheduler"""
    if scheduler.running:
        scheduler.shutdown()
        print("[CRON] Scheduler stopped")

# For manual testing
if __name__ == "__main__":
    async def test():
        await process_expired_trials()
    
    asyncio.run(test())
