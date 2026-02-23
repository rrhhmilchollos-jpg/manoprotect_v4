"""
ManoProtect - Cron Jobs Scheduler
Automatic background tasks for subscription management
"""
import asyncio
import os
from datetime import datetime, timezone
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
import httpx

# API URL for internal calls
API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:8001/api")

scheduler = AsyncIOScheduler()

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
    """Send reminders to users whose trial is expiring soon - runs daily at 9 AM"""
    print(f"[CRON] Sending trial reminders at {datetime.now(timezone.utc).isoformat()}")
    
    # This would integrate with email service to send reminders
    # For now, just log
    # TODO: Implement when email service is configured
    pass

async def cleanup_old_sessions():
    """Clean up old expired sessions - runs daily at 3 AM"""
    print(f"[CRON] Cleaning up old sessions at {datetime.now(timezone.utc).isoformat()}")
    
    # This would clean up old session data
    # TODO: Implement session cleanup
    pass

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
