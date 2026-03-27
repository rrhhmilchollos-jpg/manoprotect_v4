"""
ManoProtect - CRO (Conversion Rate Optimization) System
- A/B Testing: Assign variants, track conversions
- Email Sequences: Automated reminders for non-converting users
- Conversion Funnel: Track page views, CTA clicks, checkout, purchase
"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid
import random
import os
import logging

router = APIRouter(prefix="/cro", tags=["CRO"])

db = None
logger = logging.getLogger(__name__)

SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', os.environ.get('FROM_EMAIL', 'alertas@manoprotectt.com'))

def init_cro_routes(database):
    global db
    db = database


# ═══════════════════════════════════════════
# MODELS
# ═══════════════════════════════════════════

class ABTestVariant(BaseModel):
    test_id: str
    variant: str

class ConversionEvent(BaseModel):
    event_type: str  # page_view, cta_click, begin_checkout, purchase_complete
    page: Optional[str] = "/"
    variant: Optional[str] = None
    test_id: Optional[str] = None
    metadata: Optional[dict] = None

class EmailSequenceRequest(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    source: Optional[str] = "landing"

class EmailSequenceStatus(BaseModel):
    email: EmailStr


# ═══════════════════════════════════════════
# A/B TESTING
# ═══════════════════════════════════════════

# Active A/B tests configuration
AB_TESTS = {
    "hero_headline": {
        "variants": ["control", "variant_a"],
        "control": {
            "headline": "\u00bfY si tu hijo no responde al m\u00f3vil durante 40 minutos?",
            "subtitle": "ManoProtect te permite localizar a tu hijo en segundos y recibir alertas SOS en caso de emergencia, incluso con la app cerrada."
        },
        "variant_a": {
            "headline": "Protecci\u00f3n familiar 24/7",
            "subtitle": "Localizaci\u00f3n en tiempo real + Alertas SOS. Sabe d\u00f3nde est\u00e1 tu familia en todo momento. Incluso con la app cerrada."
        }
    },
    "cta_text": {
        "variants": ["control", "variant_a"],
        "control": {"text": "Proteger a Mi Hijo Ahora", "color": "emerald"},
        "variant_a": {"text": "Activar Protecci\u00f3n Gratis", "color": "emerald"}
    },
    "pricing_order": {
        "variants": ["control", "variant_a"],
        "control": {"order": "monthly_first"},
        "variant_a": {"order": "annual_first"}
    }
}


@router.get("/ab-test/{test_id}")
async def get_ab_variant(test_id: str, request: Request):
    """Assign a user to an A/B test variant (sticky by visitor_id cookie)"""
    if test_id not in AB_TESTS:
        raise HTTPException(status_code=404, detail="Test not found")

    test = AB_TESTS[test_id]
    visitor_id = request.cookies.get("mp_visitor_id")

    if not visitor_id:
        visitor_id = str(uuid.uuid4())

    # Check if already assigned
    existing = await db.ab_assignments.find_one(
        {"visitor_id": visitor_id, "test_id": test_id},
        {"_id": 0}
    )

    if existing:
        variant = existing["variant"]
    else:
        variant = random.choice(test["variants"])
        await db.ab_assignments.insert_one({
            "visitor_id": visitor_id,
            "test_id": test_id,
            "variant": variant,
            "assigned_at": datetime.now(timezone.utc).isoformat()
        })

    return {
        "test_id": test_id,
        "variant": variant,
        "config": test[variant],
        "visitor_id": visitor_id
    }


@router.get("/ab-test/{test_id}/results")
async def get_ab_results(test_id: str):
    """Get A/B test results with conversion rates"""
    if test_id not in AB_TESTS:
        raise HTTPException(status_code=404, detail="Test not found")

    test = AB_TESTS[test_id]
    results = {}

    for variant in test["variants"]:
        assignments = await db.ab_assignments.count_documents(
            {"test_id": test_id, "variant": variant}
        )
        conversions = await db.conversion_events.count_documents(
            {"test_id": test_id, "variant": variant, "event_type": "cta_click"}
        )
        purchases = await db.conversion_events.count_documents(
            {"test_id": test_id, "variant": variant, "event_type": "purchase_complete"}
        )

        results[variant] = {
            "visitors": assignments,
            "cta_clicks": conversions,
            "purchases": purchases,
            "click_rate": round(conversions / assignments * 100, 2) if assignments > 0 else 0,
            "purchase_rate": round(purchases / assignments * 100, 2) if assignments > 0 else 0
        }

    return {"test_id": test_id, "variants": results}


# ═══════════════════════════════════════════
# CONVERSION TRACKING
# ═══════════════════════════════════════════

@router.post("/track")
async def track_conversion(event: ConversionEvent, request: Request):
    """Track a conversion funnel event"""
    visitor_id = request.cookies.get("mp_visitor_id", str(uuid.uuid4()))
    client_ip = request.client.host if request.client else "unknown"

    doc = {
        "event_id": str(uuid.uuid4()),
        "visitor_id": visitor_id,
        "event_type": event.event_type,
        "page": event.page,
        "variant": event.variant,
        "test_id": event.test_id,
        "metadata": event.metadata or {},
        "ip": client_ip,
        "user_agent": request.headers.get("user-agent", ""),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    await db.conversion_events.insert_one(doc)
    del doc["_id"]

    return {"status": "tracked", "event_id": doc["event_id"]}


@router.get("/funnel")
async def get_conversion_funnel(days: int = 7):
    """Get conversion funnel metrics for the last N days"""
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

    pipeline = [
        {"$match": {"timestamp": {"$gte": since}}},
        {"$group": {"_id": "$event_type", "count": {"$sum": 1}}}
    ]

    results = {}
    async for doc in db.conversion_events.aggregate(pipeline):
        results[doc["_id"]] = doc["count"]

    funnel_steps = ["page_view", "cta_click", "begin_checkout", "purchase_complete"]
    funnel = []
    for step in funnel_steps:
        count = results.get(step, 0)
        funnel.append({"step": step, "count": count})

    return {
        "period_days": days,
        "funnel": funnel,
        "total_views": results.get("page_view", 0),
        "total_purchases": results.get("purchase_complete", 0),
        "conversion_rate": round(
            results.get("purchase_complete", 0) / max(results.get("page_view", 1), 1) * 100, 2
        )
    }


# ═══════════════════════════════════════════
# EMAIL SEQUENCES (Automated Reminders)
# ═══════════════════════════════════════════

EMAIL_SEQUENCE = [
    {
        "step": 1,
        "delay_hours": 24,
        "subject": "La tranquilidad de saber d\u00f3nde est\u00e1 tu familia",
        "template": "reminder_benefits"
    },
    {
        "step": 2,
        "delay_hours": 48,
        "subject": "Laura localiz\u00f3 a su hijo en 10 segundos",
        "template": "reminder_case_study"
    },
    {
        "step": 3,
        "delay_hours": 72,
        "subject": "\u00daltimo recordatorio: 7 d\u00edas gratis en ManoProtect",
        "template": "reminder_trial"
    }
]


@router.post("/email-sequence/start")
async def start_email_sequence(req: EmailSequenceRequest):
    """Start an email sequence for a non-converting user"""
    existing = await db.email_sequences.find_one(
        {"email": req.email, "status": "active"},
        {"_id": 0}
    )

    if existing:
        return {"status": "already_active", "sequence_id": existing["sequence_id"]}

    sequence_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    doc = {
        "sequence_id": sequence_id,
        "email": req.email,
        "name": req.name or "",
        "source": req.source,
        "status": "active",
        "current_step": 0,
        "emails_sent": [],
        "started_at": now.isoformat(),
        "next_send_at": (now + timedelta(hours=EMAIL_SEQUENCE[0]["delay_hours"])).isoformat(),
        "converted": False
    }

    await db.email_sequences.insert_one(doc)

    return {"status": "started", "sequence_id": sequence_id, "next_email_in_hours": EMAIL_SEQUENCE[0]["delay_hours"]}


@router.post("/email-sequence/stop")
async def stop_email_sequence(req: EmailSequenceStatus):
    """Stop email sequence (user converted or unsubscribed)"""
    result = await db.email_sequences.update_many(
        {"email": req.email, "status": "active"},
        {"$set": {"status": "stopped", "stopped_at": datetime.now(timezone.utc).isoformat()}}
    )

    return {"status": "stopped", "sequences_stopped": result.modified_count}


@router.post("/email-sequence/convert")
async def mark_converted(req: EmailSequenceStatus):
    """Mark user as converted (purchased a plan)"""
    result = await db.email_sequences.update_many(
        {"email": req.email, "status": "active"},
        {"$set": {
            "status": "converted",
            "converted": True,
            "converted_at": datetime.now(timezone.utc).isoformat()
        }}
    )

    return {"status": "converted", "sequences_updated": result.modified_count}


@router.get("/email-sequence/pending")
async def get_pending_emails():
    """Get emails that need to be sent (for cron job processing)"""
    now = datetime.now(timezone.utc).isoformat()

    pending = []
    cursor = db.email_sequences.find(
        {"status": "active", "next_send_at": {"$lte": now}},
        {"_id": 0}
    )

    async for seq in cursor:
        step = seq["current_step"]
        if step < len(EMAIL_SEQUENCE):
            email_config = EMAIL_SEQUENCE[step]
            pending.append({
                "sequence_id": seq["sequence_id"],
                "email": seq["email"],
                "name": seq.get("name", ""),
                "step": step + 1,
                "subject": email_config["subject"],
                "template": email_config["template"]
            })

    return {"pending_count": len(pending), "emails": pending}


@router.post("/email-sequence/process")
async def process_pending_emails():
    """Process and advance pending email sequences (called by cron)"""
    now = datetime.now(timezone.utc)
    now_str = now.isoformat()
    processed = 0
    sent = 0

    cursor = db.email_sequences.find(
        {"status": "active", "next_send_at": {"$lte": now_str}},
        {"_id": 0}
    )

    async for seq in cursor:
        step = seq["current_step"]
        if step >= len(EMAIL_SEQUENCE):
            await db.email_sequences.update_one(
                {"sequence_id": seq["sequence_id"]},
                {"$set": {"status": "completed"}}
            )
            continue

        email_config = EMAIL_SEQUENCE[step]
        next_step = step + 1

        # Try to send via SendGrid
        send_status = "queued"
        if SENDGRID_API_KEY:
            try:
                from sendgrid import SendGridAPIClient
                from sendgrid.helpers.mail import Mail

                html = _generate_cro_email(email_config["template"], seq.get("name", ""), seq.get("email", ""))

                message = Mail(
                    from_email=SENDER_EMAIL,
                    to_emails=seq["email"],
                    subject=email_config["subject"],
                    html_content=html
                )
                sg = SendGridAPIClient(SENDGRID_API_KEY)
                response = sg.send(message)
                send_status = "sent" if response.status_code in (200, 201, 202) else "failed"
                sent += 1
                logger.info(f"CRO email sent to {seq['email']}, step {next_step}, status {response.status_code}")
            except Exception as e:
                send_status = "failed"
                logger.error(f"CRO email send error: {e}")

        email_log = {
            "step": next_step,
            "subject": email_config["subject"],
            "template": email_config["template"],
            "sent_at": now_str,
            "status": send_status
        }

        update = {
            "$set": {"current_step": next_step},
            "$push": {"emails_sent": email_log}
        }

        if next_step < len(EMAIL_SEQUENCE):
            next_delay = EMAIL_SEQUENCE[next_step]["delay_hours"]
            update["$set"]["next_send_at"] = (now + timedelta(hours=next_delay)).isoformat()
        else:
            update["$set"]["status"] = "completed"
            update["$set"]["completed_at"] = now_str

        await db.email_sequences.update_one(
            {"sequence_id": seq["sequence_id"]},
            update
        )
        processed += 1

    return {"processed": processed, "sent": sent}


def _generate_cro_email(template, name, email):
    """Generate HTML for CRO reminder emails"""
    greeting = f"Hola {name}," if name else "Hola,"

    if template == "reminder_benefits":
        body = f"""
        <h2 style="color:#111827;font-size:22px;">La tranquilidad de saber d\u00f3nde est\u00e1 tu familia</h2>
        <p style="color:#6b7280;line-height:1.7;">
            {greeting}<br><br>
            Sabemos lo que es esa sensaci\u00f3n de angustia cuando tu hijo no contesta al m\u00f3vil.
            ManoProtect te permite localizarle en segundos, recibir alertas SOS instant\u00e1neas
            y dormir tranquilo sabiendo que est\u00e1 protegido 24/7.
        </p>
        <ul style="color:#6b7280;line-height:2;">
            <li>GPS en segundo plano (funciona con la app cerrada)</li>
            <li>Alertas SOS con un solo toque</li>
            <li>Protecci\u00f3n para hasta 5 familiares</li>
            <li>Solo 9,99\u20ac/mes</li>
        </ul>
        """
    elif template == "reminder_case_study":
        body = f"""
        <h2 style="color:#111827;font-size:22px;">Laura localiz\u00f3 a su hijo en 10 segundos</h2>
        <p style="color:#6b7280;line-height:1.7;">
            {greeting}<br><br>
            Laura M. de Madrid ten\u00eda el mismo miedo que t\u00fa. Su hijo de 15 a\u00f1os perd\u00edo
            el autob\u00fas y no contestaba al tel\u00e9fono. Gracias a ManoProtect, supo d\u00f3nde
            estaba en 10 segundos.
        </p>
        <blockquote style="border-left:4px solid #10b981;padding:12px 16px;margin:16px 0;background:#f0fdf4;color:#374151;font-style:italic;">
            "No tiene precio la tranquilidad que me da. Mi hijo ni se entera y yo duermo tranquila."
            <br><strong>- Laura M., Madrid</strong>
        </blockquote>
        """
    else:
        body = f"""
        <h2 style="color:#111827;font-size:22px;">\u00daltimo recordatorio: 7 d\u00edas gratis</h2>
        <p style="color:#6b7280;line-height:1.7;">
            {greeting}<br><br>
            Esta es la \u00faltima vez que te escribimos. Tu prueba gratuita de 7 d\u00edas
            te est\u00e1 esperando. Sin tarjeta, sin compromiso.
        </p>
        <p style="color:#6b7280;line-height:1.7;">
            El 78% de los padres ha sentido angustia al no saber d\u00f3nde estaba su hijo
            durante m\u00e1s de 30 minutos. No dejes que te pase a ti.
        </p>
        """

    return f"""<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#f4f4f5;">
    <div style="max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:white;border-radius:12px;padding:32px;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
            <div style="text-align:center;margin-bottom:24px;">
                <span style="font-size:28px;font-weight:bold;color:#10b981;">ManoProtect</span>
            </div>
            {body}
            <div style="text-align:center;margin-top:24px;">
                <a href="https://manoprotectt.com/registro" style="display:inline-block;background:#10b981;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px;">Proteger a Mi Familia Ahora</a>
            </div>
            <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:24px;">
                Si no quieres recibir m\u00e1s emails, <a href="https://manoprotectt.com/unsubscribe?email={email}" style="color:#9ca3af;">cancela aqu\u00ed</a>.
            </p>
        </div>
    </div>
    </body></html>"""


# ═══════════════════════════════════════════
# ANALYTICS DASHBOARD
# ═══════════════════════════════════════════

@router.get("/dashboard")
async def get_cro_dashboard():
    """Get CRO dashboard with key metrics"""
    now = datetime.now(timezone.utc)
    today = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()

    # Today's events
    today_views = await db.conversion_events.count_documents(
        {"event_type": "page_view", "timestamp": {"$gte": today}}
    )
    today_clicks = await db.conversion_events.count_documents(
        {"event_type": "cta_click", "timestamp": {"$gte": today}}
    )

    # Email sequences
    active_sequences = await db.email_sequences.count_documents({"status": "active"})
    total_converted = await db.email_sequences.count_documents({"converted": True})

    # A/B tests active
    active_tests = list(AB_TESTS.keys())

    return {
        "today": {
            "page_views": today_views,
            "cta_clicks": today_clicks,
            "click_rate": round(today_clicks / max(today_views, 1) * 100, 2)
        },
        "email_sequences": {
            "active": active_sequences,
            "converted": total_converted
        },
        "ab_tests_active": active_tests,
        "generated_at": now.isoformat()
    }
