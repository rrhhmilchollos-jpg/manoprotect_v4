"""
MANO - Email Notification Service
Automated email alerts for security events
"""
from typing import Dict, List, Optional
from datetime import datetime, timezone
import os
from core.config import db

# Email configuration - will use SendGrid when configured
SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
FROM_EMAIL = os.environ.get('SENDER_EMAIL', os.environ.get('FROM_EMAIL', 'alertas@manoprotect.com'))


class EmailNotificationService:
    """
    Email notification service for automated security alerts
    Uses SendGrid when API key is configured, otherwise queues emails
    """
    
    def __init__(self):
        self.is_configured = bool(SENDGRID_API_KEY)
        self.templates = {
            'threat_detected': {
                'subject': '⚠️ MANO: Amenaza Detectada - {risk_level}',
                'template': 'threat_alert'
            },
            'transaction_suspicious': {
                'subject': '🏦 MANO: Transacción Sospechosa - €{amount}',
                'template': 'transaction_alert'
            },
            'daily_summary': {
                'subject': '📊 MANO: Tu Resumen de Seguridad Diario',
                'template': 'daily_summary'
            },
            'sos_alert': {
                'subject': '🆘 MANO: Alerta SOS de {user_name}',
                'template': 'sos_alert'
            },
            'family_alert': {
                'subject': '👨‍👩‍👧 MANO: Alerta Familiar - {member_name}',
                'template': 'family_alert'
            },
            'welcome': {
                'subject': '🛡️ Bienvenido a MANO - Tu Protección Digital',
                'template': 'welcome'
            },
            'reward_earned': {
                'subject': '🎉 MANO: ¡Has ganado {points} puntos!',
                'template': 'reward'
            }
        }
    
    async def send_threat_alert(
        self,
        user_id: str,
        email: str,
        threat_data: Dict
    ) -> Dict:
        """Send threat detection alert email"""
        content = self._generate_threat_email(threat_data)
        
        return await self._send_email(
            to_email=email,
            subject=self.templates['threat_detected']['subject'].format(
                risk_level=threat_data.get('risk_level', 'Alto').upper()
            ),
            html_content=content,
            email_type='threat_detected',
            user_id=user_id,
            metadata=threat_data
        )
    
    async def send_transaction_alert(
        self,
        user_id: str,
        email: str,
        transaction_data: Dict
    ) -> Dict:
        """Send suspicious transaction alert email"""
        content = self._generate_transaction_email(transaction_data)
        
        return await self._send_email(
            to_email=email,
            subject=self.templates['transaction_suspicious']['subject'].format(
                amount=transaction_data.get('amount', 0)
            ),
            html_content=content,
            email_type='transaction_suspicious',
            user_id=user_id,
            metadata=transaction_data
        )
    
    async def send_daily_summary(
        self,
        user_id: str,
        email: str,
        summary_data: Dict
    ) -> Dict:
        """Send daily security summary email"""
        content = self._generate_summary_email(summary_data)
        
        return await self._send_email(
            to_email=email,
            subject=self.templates['daily_summary']['subject'],
            html_content=content,
            email_type='daily_summary',
            user_id=user_id,
            metadata=summary_data
        )
    
    async def send_reward_notification(
        self,
        user_id: str,
        email: str,
        reward_data: Dict
    ) -> Dict:
        """Send reward earned notification"""
        content = self._generate_reward_email(reward_data)
        
        return await self._send_email(
            to_email=email,
            subject=self.templates['reward_earned']['subject'].format(
                points=reward_data.get('points', 0)
            ),
            html_content=content,
            email_type='reward_earned',
            user_id=user_id,
            metadata=reward_data
        )
    
    async def _send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        email_type: str,
        user_id: str,
        metadata: Dict = {}
    ) -> Dict:
        """Send email via SendGrid or queue if not configured"""
        
        email_record = {
            "id": f"email_{datetime.now(timezone.utc).timestamp()}",
            "user_id": user_id,
            "to_email": to_email,
            "subject": subject,
            "email_type": email_type,
            "status": "pending",
            "metadata": metadata,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        if self.is_configured:
            try:
                # Import SendGrid only when needed
                from sendgrid import SendGridAPIClient
                from sendgrid.helpers.mail import Mail
                
                message = Mail(
                    from_email=FROM_EMAIL,
                    to_emails=to_email,
                    subject=subject,
                    html_content=html_content
                )
                
                sg = SendGridAPIClient(SENDGRID_API_KEY)
                response = sg.send(message)
                
                email_record["status"] = "sent"
                email_record["sendgrid_status"] = response.status_code
                
            except Exception as e:
                email_record["status"] = "failed"
                email_record["error"] = str(e)
        else:
            email_record["status"] = "queued"
            email_record["note"] = "SendGrid not configured - email queued"
        
        # Save to database
        await db.email_notifications.insert_one(email_record)
        
        return {
            "success": email_record["status"] in ["sent", "queued"],
            "status": email_record["status"],
            "email_id": email_record["id"],
            "message": "Email enviado" if email_record["status"] == "sent" else "Email en cola (SendGrid no configurado)"
        }
    
    def _generate_threat_email(self, data: Dict) -> str:
        """Generate threat alert HTML email"""
        risk_color = {
            'critical': '#dc2626',
            'high': '#ea580c',
            'medium': '#ca8a04',
            'low': '#16a34a'
        }.get(data.get('risk_level', 'medium'), '#ca8a04')
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f4f4f5; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .card {{ background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                .header {{ text-align: center; margin-bottom: 24px; }}
                .logo {{ font-size: 32px; font-weight: bold; color: #4f46e5; }}
                .alert-box {{ background: {risk_color}15; border-left: 4px solid {risk_color}; padding: 16px; border-radius: 8px; margin: 16px 0; }}
                .risk-badge {{ display: inline-block; background: {risk_color}; color: white; padding: 4px 12px; border-radius: 20px; font-weight: bold; }}
                .section {{ margin: 20px 0; }}
                .section-title {{ font-weight: 600; color: #27272a; margin-bottom: 8px; }}
                .btn {{ display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }}
                .footer {{ text-align: center; color: #71717a; font-size: 12px; margin-top: 24px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <div class="header">
                        <div class="logo">🛡️ MANO</div>
                        <h2>Amenaza Detectada</h2>
                    </div>
                    
                    <div class="alert-box">
                        <strong>⚠️ Nivel de Riesgo:</strong> 
                        <span class="risk-badge">{data.get('risk_level', 'ALTO').upper()}</span>
                        <p style="margin: 8px 0 0 0;">Puntuación: {data.get('risk_score', 0)}%</p>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">Tipos de Amenaza</div>
                        <p>{', '.join(data.get('threat_types', ['Desconocido']))}</p>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">Análisis</div>
                        <p>{data.get('analysis', 'Sin análisis disponible')}</p>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">Recomendación</div>
                        <p style="background: #f0fdf4; padding: 12px; border-radius: 8px;">
                            {data.get('recommendation', 'Mantén precaución')}
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 24px;">
                        <a href="#" class="btn">Ver en Dashboard</a>
                    </div>
                </div>
                
                <div class="footer">
                    <p>MANO - Protección contra Fraudes Digitales</p>
                    <p>Este email fue enviado automáticamente. No respondas a este mensaje.</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _generate_transaction_email(self, data: Dict) -> str:
        """Generate transaction alert HTML email"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f4f4f5; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .card {{ background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                .header {{ text-align: center; margin-bottom: 24px; }}
                .logo {{ font-size: 32px; font-weight: bold; color: #4f46e5; }}
                .amount {{ font-size: 36px; font-weight: bold; color: #dc2626; text-align: center; }}
                .alert-box {{ background: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin: 16px 0; }}
                .detail-row {{ display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f4f4f5; }}
                .btn {{ display: inline-block; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 4px; }}
                .btn-danger {{ background: #dc2626; color: white; }}
                .btn-success {{ background: #16a34a; color: white; }}
                .footer {{ text-align: center; color: #71717a; font-size: 12px; margin-top: 24px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <div class="header">
                        <div class="logo">🏦 MANO</div>
                        <h2>Transacción Sospechosa</h2>
                    </div>
                    
                    <div class="amount">€{data.get('amount', 0):,.2f}</div>
                    
                    <div class="alert-box">
                        <strong>⚠️ Esta transacción requiere tu atención</strong>
                        <p>Hemos detectado indicadores de riesgo en esta operación.</p>
                    </div>
                    
                    <div style="margin: 20px 0;">
                        <div class="detail-row">
                            <span>Comercio:</span>
                            <strong>{data.get('merchant', 'Desconocido')}</strong>
                        </div>
                        <div class="detail-row">
                            <span>Descripción:</span>
                            <strong>{data.get('description', '-')}</strong>
                        </div>
                        <div class="detail-row">
                            <span>Puntuación de Riesgo:</span>
                            <strong style="color: #dc2626;">{data.get('risk_score', 0)}%</strong>
                        </div>
                        <div class="detail-row">
                            <span>Factores de Riesgo:</span>
                            <strong>{', '.join(data.get('risk_factors', [])[:3])}</strong>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 24px;">
                        <a href="#" class="btn btn-danger">🚫 Bloquear</a>
                        <a href="#" class="btn btn-success">✅ Aprobar</a>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Si no reconoces esta transacción, contacta inmediatamente con tu banco.</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _generate_summary_email(self, data: Dict) -> str:
        """Generate daily summary HTML email"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f4f4f5; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .card {{ background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                .header {{ text-align: center; margin-bottom: 24px; }}
                .logo {{ font-size: 32px; font-weight: bold; color: #4f46e5; }}
                .stats-grid {{ display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 20px 0; }}
                .stat-card {{ background: #f4f4f5; padding: 16px; border-radius: 8px; text-align: center; }}
                .stat-value {{ font-size: 28px; font-weight: bold; color: #4f46e5; }}
                .stat-label {{ font-size: 12px; color: #71717a; }}
                .protection-bar {{ background: #e5e7eb; border-radius: 8px; height: 12px; overflow: hidden; }}
                .protection-fill {{ background: linear-gradient(90deg, #4f46e5, #22c55e); height: 100%; }}
                .btn {{ display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }}
                .footer {{ text-align: center; color: #71717a; font-size: 12px; margin-top: 24px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <div class="header">
                        <div class="logo">📊 MANO</div>
                        <h2>Tu Resumen de Seguridad</h2>
                        <p style="color: #71717a;">{datetime.now().strftime('%d de %B, %Y')}</p>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value">{data.get('analyzed_today', 0)}</div>
                            <div class="stat-label">Analizados Hoy</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" style="color: #dc2626;">{data.get('threats_blocked', 0)}</div>
                            <div class="stat-label">Amenazas Bloqueadas</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" style="color: #22c55e;">{data.get('safe_items', 0)}</div>
                            <div class="stat-label">Verificados Seguros</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">{data.get('points_earned', 0)}</div>
                            <div class="stat-label">Puntos Ganados</div>
                        </div>
                    </div>
                    
                    <div style="margin: 24px 0;">
                        <p style="margin-bottom: 8px;"><strong>Nivel de Protección</strong></p>
                        <div class="protection-bar">
                            <div class="protection-fill" style="width: {data.get('protection_rate', 100)}%;"></div>
                        </div>
                        <p style="text-align: right; font-size: 14px; color: #22c55e; margin-top: 4px;">
                            {data.get('protection_rate', 100)}% protegido
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 24px;">
                        <a href="#" class="btn">Ver Dashboard Completo</a>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Gracias por confiar en MANO para tu seguridad digital.</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _generate_reward_email(self, data: Dict) -> str:
        """Generate reward notification HTML email"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f4f4f5; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .card {{ background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); color: white; }}
                .header {{ text-align: center; margin-bottom: 24px; }}
                .points {{ font-size: 64px; font-weight: bold; text-align: center; }}
                .badge {{ display: inline-block; background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; margin: 8px 0; }}
                .reason {{ background: rgba(255,255,255,0.1); padding: 16px; border-radius: 8px; margin: 16px 0; text-align: center; }}
                .btn {{ display: inline-block; background: white; color: #4f46e5; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }}
                .footer {{ text-align: center; color: #71717a; font-size: 12px; margin-top: 24px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <div class="header">
                        <h1>🎉 ¡Felicidades!</h1>
                    </div>
                    
                    <div class="points">+{data.get('points', 0)}</div>
                    <p style="text-align: center; font-size: 18px;">puntos ganados</p>
                    
                    <div class="reason">
                        <p><strong>Razón:</strong></p>
                        <p>{data.get('reason', 'Actividad en la plataforma')}</p>
                    </div>
                    
                    <div style="text-align: center;">
                        <span class="badge">🏆 Total: {data.get('total_points', 0)} puntos</span>
                        <span class="badge">📊 Nivel: {data.get('level', 'Bronce')}</span>
                    </div>
                    
                    <div style="text-align: center; margin-top: 24px;">
                        <a href="#" class="btn">Ver Mis Recompensas</a>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Sigue protegiendo tu comunidad para ganar más puntos.</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    async def get_email_queue(self, user_id: Optional[str] = None) -> List[Dict]:
        """Get queued/pending emails"""
        query = {"status": {"$in": ["pending", "queued"]}}
        if user_id:
            query["user_id"] = user_id
        
        emails = await db.email_notifications.find(
            query,
            {"_id": 0}
        ).sort("created_at", -1).limit(50).to_list(50)
        
        return emails

    async def send_sos_alert_to_family(
        self,
        sos_data: Dict,
        family_members: list
    ) -> Dict:
        """Send SOS emergency alert to all family members"""
        
        results = {
            "total": len(family_members),
            "sent": 0,
            "failed": 0,
            "emails_sent": []
        }
        
        for member in family_members:
            email = member.get("email")
            if not email:
                continue
            
            try:
                html_content = self._generate_sos_email(sos_data, member)
                subject = f"🆘 ¡EMERGENCIA! {sos_data.get('user_name', 'Un familiar')} necesita ayuda URGENTE"
                
                result = await self._send_email(
                    to_email=email,
                    subject=subject,
                    html_content=html_content,
                    email_type="sos_alert",
                    user_id=sos_data.get("user_id", ""),
                    metadata={
                        "sos_id": sos_data.get("sos_id"),
                        "member_id": member.get("id"),
                        "member_name": member.get("name")
                    }
                )
                
                if result.get("success"):
                    results["sent"] += 1
                    results["emails_sent"].append(email)
                else:
                    results["failed"] += 1
                    
            except Exception as e:
                results["failed"] += 1
        
        return results
    
    def _generate_sos_email(self, sos_data: Dict, member: Dict) -> str:
        """Generate SOS emergency alert HTML email"""
        
        user_name = sos_data.get("user_name", "Un familiar")
        message = sos_data.get("message", "¡Necesito ayuda urgente!")
        location = sos_data.get("location", {})
        lat = location.get("latitude", "")
        lng = location.get("longitude", "")
        
        # Google Maps link
        maps_link = f"https://www.google.com/maps?q={lat},{lng}" if lat and lng else ""
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #1f2937;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <!-- Emergency Header -->
                <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 32px;">🆘 ¡EMERGENCIA!</h1>
                    <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 18px;">Alerta SOS de ManoProtect</p>
                </div>
                
                <!-- Content -->
                <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px;">
                    <div style="text-align: center; padding: 20px; background: #fef2f2; border-radius: 8px; margin-bottom: 20px;">
                        <p style="font-size: 24px; font-weight: bold; color: #dc2626; margin: 0;">
                            {user_name}
                        </p>
                        <p style="color: #991b1b; margin: 10px 0 0 0; font-size: 16px;">
                            necesita tu ayuda URGENTE
                        </p>
                    </div>
                    
                    <!-- Message -->
                    <div style="padding: 20px; background: #fef3c7; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
                        <p style="margin: 0; color: #92400e; font-size: 16px;">
                            <strong>Mensaje:</strong><br>
                            {message}
                        </p>
                    </div>
                    
                    <!-- Location -->
                    {f'''
                    <div style="margin-bottom: 20px;">
                        <p style="color: #374151; font-weight: bold; margin: 0 0 10px 0;">
                            📍 Ubicación GPS:
                        </p>
                        <p style="color: #6b7280; margin: 0 0 15px 0;">
                            Latitud: {lat}<br>
                            Longitud: {lng}
                        </p>
                        <a href="{maps_link}" 
                           style="display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                            📍 Ver en Google Maps
                        </a>
                    </div>
                    ''' if maps_link else ''}
                    
                    <!-- Call to Action -->
                    <div style="text-align: center; padding: 20px; background: #ecfdf5; border-radius: 8px;">
                        <p style="color: #065f46; font-weight: bold; margin: 0 0 15px 0;">
                            ¿Qué hacer?
                        </p>
                        <ol style="text-align: left; color: #047857; margin: 0; padding-left: 20px;">
                            <li style="margin-bottom: 8px;">Intenta contactar con {user_name}</li>
                            <li style="margin-bottom: 8px;">Si no responde, llama al <strong>112</strong></li>
                            <li style="margin-bottom: 8px;">Dirígete a su ubicación si es posible</li>
                        </ol>
                    </div>
                    
                    <!-- Emergency Call Button -->
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="tel:112" 
                           style="display: inline-block; background: #dc2626; color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">
                            📞 Llamar al 112
                        </a>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="text-align: center; padding: 20px; color: #9ca3af;">
                    <p style="margin: 0; font-size: 12px;">
                        Este email fue enviado automáticamente por ManoProtect<br>
                        STARTBOOKING SL - CIF: B19427723
                    </p>
                </div>
            </div>
        </body>
        </html>
        """

    async def send_family_invite(
        self,
        owner_name: str,
        member_data: dict,
        invite_link: str
    ) -> dict:
        """Send family invitation email with link to join"""
        
        email = member_data.get("email")
        if not email:
            return {"success": False, "error": "No email provided"}
        
        member_name = member_data.get("name", "")
        member_id = member_data.get("child_id", "")
        
        html_content = self._generate_family_invite_email(
            owner_name=owner_name,
            member_name=member_name,
            invite_link=invite_link
        )
        
        result = await self._send_email(
            to_email=email,
            subject=f"👨‍👩‍👧 {owner_name} te ha añadido a su familia en ManoProtect",
            html_content=html_content,
            email_type="family_invite",
            user_id=member_id,
            metadata={
                "member_id": member_id,
                "member_name": member_name,
                "owner_name": owner_name
            }
        )
        
        return result
    
    def _generate_family_invite_email(self, owner_name: str, member_name: str, invite_link: str) -> str:
        """Generate family invitation HTML email"""
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">👨‍👩‍👧 Invitación Familiar</h1>
                    <p style="color: #d1fae5; margin: 10px 0 0 0;">ManoProtect - Protección Digital</p>
                </div>
                
                <!-- Content -->
                <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px;">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <p style="font-size: 18px; color: #374151; margin: 0;">
                            ¡Hola <strong>{member_name}</strong>!
                        </p>
                    </div>
                    
                    <div style="padding: 20px; background: #ecfdf5; border-radius: 8px; margin-bottom: 25px;">
                        <p style="margin: 0; color: #065f46; font-size: 16px; text-align: center;">
                            <strong>{owner_name}</strong> te ha añadido a su familia<br>
                            en ManoProtect para poder localizarte en caso de emergencia.
                        </p>
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <p style="color: #374151; font-weight: bold; margin: 0 0 15px 0;">
                            ¿Qué significa esto?
                        </p>
                        <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
                            <li style="margin-bottom: 8px;">Tu familiar podrá ver tu ubicación cuando la solicite</li>
                            <li style="margin-bottom: 8px;">Recibirás alertas SOS si alguien de la familia necesita ayuda</li>
                            <li style="margin-bottom: 8px;">Estarás protegido contra fraudes y estafas</li>
                        </ul>
                    </div>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{invite_link}" 
                           style="display: inline-block; background: #10b981; color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                            📱 Vincular mi dispositivo
                        </a>
                    </div>
                    
                    <div style="padding: 15px; background: #fef3c7; border-radius: 8px; margin-bottom: 20px;">
                        <p style="margin: 0; color: #92400e; font-size: 14px; text-align: center;">
                            <strong>Tu código de vinculación:</strong><br>
                            <span style="font-size: 24px; font-family: monospace; letter-spacing: 3px;">{member_name[:3].upper()}{hash(invite_link) % 10000:04d}</span>
                        </p>
                    </div>
                    
                    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
                        <p style="color: #6b7280; font-size: 14px; margin: 0;">
                            <strong>Pasos para vincular:</strong>
                        </p>
                        <ol style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0; padding-left: 20px;">
                            <li>Descarga la app ManoProtect</li>
                            <li>Abre el enlace de arriba o introduce el código</li>
                            <li>¡Listo! Ya estarás conectado con tu familia</li>
                        </ol>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="text-align: center; padding: 20px; color: #9ca3af;">
                    <p style="margin: 0; font-size: 12px;">
                        Este email fue enviado por ManoProtect<br>
                        STARTBOOKING SL - CIF: B19427723<br><br>
                        Si no reconoces esta invitación, puedes ignorar este email.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """

    # ============================================
    # TRIAL SUBSCRIPTION EMAIL METHODS
    # ============================================
    
    async def send_trial_started_email(
        self,
        user_id: str,
        email: str,
        trial_data: Dict
    ) -> Dict:
        """Send email when trial subscription starts"""
        content = self._generate_trial_started_email(trial_data)
        
        return await self._send_email(
            to_email=email,
            subject='🎁 ManoProtect: ¡Tu prueba de 7 días ha comenzado!',
            html_content=content,
            email_type='trial_started',
            user_id=user_id,
            metadata=trial_data
        )
    
    async def send_trial_ending_soon_email(
        self,
        user_id: str,
        email: str,
        trial_data: Dict
    ) -> Dict:
        """Send email 2 days before trial ends"""
        content = self._generate_trial_ending_email(trial_data)
        
        days_left = trial_data.get('days_left', 2)
        return await self._send_email(
            to_email=email,
            subject=f'⏰ ManoProtect: Tu prueba termina en {days_left} días',
            html_content=content,
            email_type='trial_ending_soon',
            user_id=user_id,
            metadata=trial_data
        )
    
    async def send_trial_ended_email(
        self,
        user_id: str,
        email: str,
        trial_data: Dict
    ) -> Dict:
        """Send email when trial ends and subscription starts"""
        content = self._generate_trial_ended_email(trial_data)
        
        return await self._send_email(
            to_email=email,
            subject='✅ ManoProtect: Tu suscripción Premium está activa',
            html_content=content,
            email_type='trial_ended',
            user_id=user_id,
            metadata=trial_data
        )
    
    async def send_trial_canceled_email(
        self,
        user_id: str,
        email: str,
        trial_data: Dict
    ) -> Dict:
        """Send email when user cancels trial"""
        content = self._generate_trial_canceled_email(trial_data)
        
        return await self._send_email(
            to_email=email,
            subject='👋 ManoProtect: Tu prueba ha sido cancelada',
            html_content=content,
            email_type='trial_canceled',
            user_id=user_id,
            metadata=trial_data
        )
    
    def _generate_trial_started_email(self, data: Dict) -> str:
        """Generate trial started HTML email"""
        trial_end = data.get('trial_end', 'en 7 días')
        plan_name = data.get('plan_name', 'Premium Mensual')
        plan_price = data.get('plan_price', '29.99')
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #fffbeb; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .card {{ background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                .header {{ text-align: center; margin-bottom: 24px; }}
                .logo {{ font-size: 40px; margin-bottom: 8px; }}
                .success-badge {{ display: inline-block; background: #10b981; color: white; padding: 8px 20px; border-radius: 24px; font-weight: bold; font-size: 14px; }}
                .info-box {{ background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 12px; margin: 24px 0; }}
                .timeline {{ margin: 24px 0; }}
                .timeline-item {{ display: flex; align-items: flex-start; margin: 16px 0; }}
                .timeline-dot {{ width: 12px; height: 12px; background: #f59e0b; border-radius: 50%; margin-right: 12px; margin-top: 4px; }}
                .btn {{ display: inline-block; background: #f59e0b; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; }}
                .footer {{ text-align: center; color: #71717a; font-size: 12px; margin-top: 32px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <div class="header">
                        <div class="logo">🎁</div>
                        <h1 style="margin: 0; color: #1f2937;">¡Tu prueba ha comenzado!</h1>
                        <p style="color: #6b7280; margin-top: 8px;">Disfruta de 7 días gratis de ManoProtect Premium</p>
                    </div>
                    
                    <div style="text-align: center; margin: 24px 0;">
                        <span class="success-badge">✓ TRIAL ACTIVADO</span>
                    </div>
                    
                    <div class="info-box">
                        <h3 style="margin: 0 0 12px 0; color: #92400e;">📅 Información importante</h3>
                        <p style="margin: 0; color: #78350f;">
                            Tu prueba gratuita termina el <strong>{trial_end}</strong>.<br><br>
                            Si no cancelas antes, se activará automáticamente tu plan <strong>{plan_name}</strong> por <strong>€{plan_price}/mes</strong>.
                        </p>
                    </div>
                    
                    <h3 style="color: #1f2937;">Durante tu prueba tienes acceso a:</h3>
                    <div class="timeline">
                        <div class="timeline-item">
                            <div class="timeline-dot"></div>
                            <div>
                                <strong>Protección ilimitada</strong><br>
                                <span style="color: #6b7280;">Analiza todas las amenazas que quieras</span>
                            </div>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-dot"></div>
                            <div>
                                <strong>Alertas en tiempo real</strong><br>
                                <span style="color: #6b7280;">Notificaciones instantáneas de nuevas amenazas</span>
                            </div>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-dot"></div>
                            <div>
                                <strong>Protección familiar</strong><br>
                                <span style="color: #6b7280;">Protege hasta 2 miembros de tu familia</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 32px;">
                        <a href="https://manoprotect.com/dashboard" class="btn">Ir al Dashboard</a>
                    </div>
                    
                    <p style="text-align: center; color: #9ca3af; font-size: 13px; margin-top: 24px;">
                        Puedes cancelar tu prueba en cualquier momento sin ningún cargo desde tu perfil.
                    </p>
                </div>
                
                <div class="footer">
                    <p>ManoProtect - Protección contra Fraudes Digitales<br>
                    STARTBOOKING SL - CIF: B19427723</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _generate_trial_ending_email(self, data: Dict) -> str:
        """Generate trial ending soon HTML email"""
        days_left = data.get('days_left', 2)
        trial_end = data.get('trial_end', 'pronto')
        plan_name = data.get('plan_name', 'Premium Mensual')
        plan_price = data.get('plan_price', '29.99')
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #fef2f2; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .card {{ background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                .header {{ text-align: center; margin-bottom: 24px; }}
                .countdown {{ font-size: 64px; font-weight: bold; color: #dc2626; text-align: center; margin: 24px 0; }}
                .countdown-label {{ text-align: center; color: #6b7280; margin-top: -16px; }}
                .warning-box {{ background: #fef2f2; border: 2px solid #fca5a5; padding: 20px; border-radius: 12px; margin: 24px 0; }}
                .options {{ display: flex; gap: 16px; justify-content: center; margin-top: 32px; }}
                .btn {{ display: inline-block; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; }}
                .btn-primary {{ background: #10b981; color: white; }}
                .btn-secondary {{ background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }}
                .footer {{ text-align: center; color: #71717a; font-size: 12px; margin-top: 32px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <div class="header">
                        <h1 style="margin: 0; color: #1f2937;">⏰ Tu prueba está por terminar</h1>
                    </div>
                    
                    <div class="countdown">{days_left}</div>
                    <p class="countdown-label">días restantes</p>
                    
                    <div class="warning-box">
                        <h3 style="margin: 0 0 12px 0; color: #991b1b;">⚠️ Recordatorio</h3>
                        <p style="margin: 0; color: #7f1d1d;">
                            Tu prueba gratuita termina el <strong>{trial_end}</strong>.<br><br>
                            Si deseas continuar con ManoProtect Premium, no necesitas hacer nada. 
                            Se activará automáticamente tu plan <strong>{plan_name}</strong> por <strong>€{plan_price}/mes</strong>.
                        </p>
                    </div>
                    
                    <h3 style="color: #1f2937; text-align: center;">¿Qué quieres hacer?</h3>
                    
                    <div class="options">
                        <a href="https://manoprotect.com/dashboard" class="btn btn-primary">Continuar con Premium</a>
                        <a href="https://manoprotect.com/profile" class="btn btn-secondary">Cancelar prueba</a>
                    </div>
                    
                    <p style="text-align: center; color: #9ca3af; font-size: 13px; margin-top: 24px;">
                        Si cancelas antes de que termine la prueba, no se realizará ningún cargo.
                    </p>
                </div>
                
                <div class="footer">
                    <p>ManoProtect - Protección contra Fraudes Digitales<br>
                    STARTBOOKING SL - CIF: B19427723</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _generate_trial_ended_email(self, data: Dict) -> str:
        """Generate trial ended / subscription active HTML email"""
        plan_name = data.get('plan_name', 'Premium Mensual')
        plan_price = data.get('plan_price', '29.99')
        next_billing = data.get('next_billing', 'en 30 días')
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #ecfdf5; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .card {{ background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                .header {{ text-align: center; margin-bottom: 24px; }}
                .success-icon {{ font-size: 64px; margin-bottom: 16px; }}
                .badge {{ display: inline-block; background: #10b981; color: white; padding: 8px 20px; border-radius: 24px; font-weight: bold; }}
                .info-box {{ background: #f0fdf4; border: 2px solid #86efac; padding: 20px; border-radius: 12px; margin: 24px 0; }}
                .receipt {{ background: #f9fafb; border-radius: 8px; padding: 16px; margin: 24px 0; }}
                .receipt-row {{ display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }}
                .receipt-row:last-child {{ border-bottom: none; font-weight: bold; }}
                .btn {{ display: inline-block; background: #10b981; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; }}
                .footer {{ text-align: center; color: #71717a; font-size: 12px; margin-top: 32px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <div class="header">
                        <div class="success-icon">✅</div>
                        <h1 style="margin: 0; color: #1f2937;">¡Bienvenido a Premium!</h1>
                        <p style="color: #6b7280; margin-top: 8px;">Tu suscripción está ahora activa</p>
                    </div>
                    
                    <div style="text-align: center; margin: 24px 0;">
                        <span class="badge">PREMIUM ACTIVO</span>
                    </div>
                    
                    <div class="info-box">
                        <h3 style="margin: 0 0 12px 0; color: #166534;">🎉 ¡Gracias por confiar en ManoProtect!</h3>
                        <p style="margin: 0; color: #15803d;">
                            Tu periodo de prueba ha finalizado y ahora eres miembro Premium.
                            Continuarás disfrutando de todas las funciones sin interrupción.
                        </p>
                    </div>
                    
                    <div class="receipt">
                        <h4 style="margin: 0 0 16px 0; color: #1f2937;">Detalles de tu suscripción</h4>
                        <div class="receipt-row">
                            <span>Plan</span>
                            <span>{plan_name}</span>
                        </div>
                        <div class="receipt-row">
                            <span>Precio</span>
                            <span>€{plan_price}/mes</span>
                        </div>
                        <div class="receipt-row">
                            <span>Próximo cobro</span>
                            <span>{next_billing}</span>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 32px;">
                        <a href="https://manoprotect.com/dashboard" class="btn">Ir al Dashboard</a>
                    </div>
                </div>
                
                <div class="footer">
                    <p>ManoProtect - Protección contra Fraudes Digitales<br>
                    STARTBOOKING SL - CIF: B19427723<br><br>
                    Puedes gestionar tu suscripción desde tu perfil en cualquier momento.</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _generate_trial_canceled_email(self, data: Dict) -> str:
        """Generate trial canceled HTML email"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f4f4f5; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .card {{ background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                .header {{ text-align: center; margin-bottom: 24px; }}
                .icon {{ font-size: 64px; margin-bottom: 16px; }}
                .info-box {{ background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 24px 0; }}
                .btn {{ display: inline-block; background: #4f46e5; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; }}
                .footer {{ text-align: center; color: #71717a; font-size: 12px; margin-top: 32px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <div class="header">
                        <div class="icon">👋</div>
                        <h1 style="margin: 0; color: #1f2937;">Prueba cancelada</h1>
                        <p style="color: #6b7280; margin-top: 8px;">No se realizará ningún cargo</p>
                    </div>
                    
                    <div class="info-box">
                        <h3 style="margin: 0 0 12px 0; color: #374151;">Tu prueba ha sido cancelada</h3>
                        <p style="margin: 0; color: #6b7280;">
                            Hemos cancelado tu periodo de prueba como solicitaste. 
                            No se ha realizado ningún cargo a tu tarjeta.<br><br>
                            Tu cuenta ahora tiene el plan gratuito con funcionalidades básicas.
                        </p>
                    </div>
                    
                    <h3 style="color: #1f2937;">¿Nos extrañarás? 😢</h3>
                    <p style="color: #6b7280;">
                        Si cambias de opinión, siempre puedes volver a activar Premium.
                        Estaremos aquí para protegerte cuando lo necesites.
                    </p>
                    
                    <div style="text-align: center; margin-top: 32px;">
                        <a href="https://manoprotect.com/pricing" class="btn">Ver planes disponibles</a>
                    </div>
                </div>
                
                <div class="footer">
                    <p>ManoProtect - Protección contra Fraudes Digitales<br>
                    STARTBOOKING SL - CIF: B19427723</p>
                </div>
            </div>
        </body>
        </html>
        """

    # ============================================
    # DEVICE ORDER EMAIL METHODS
    # ============================================
    
    async def send_device_order_confirmation(
        self,
        user_id: str,
        email: str,
        order_data: Dict
    ) -> Dict:
        """Send order confirmation email after successful device purchase"""
        content = self._generate_device_order_email(order_data)
        order_id = order_data.get('order_id', 'UNKNOWN')[:8].upper()
        
        return await self._send_email(
            to_email=email,
            subject=f'✅ Confirmación de Pedido #{order_id} - ManoProtect',
            html_content=content,
            email_type='device_order_confirmation',
            user_id=user_id,
            metadata=order_data
        )
    
    async def send_shipping_update(
        self,
        user_id: str,
        email: str,
        shipping_data: Dict
    ) -> Dict:
        """Send shipping status update email"""
        content = self._generate_shipping_update_email(shipping_data)
        order_id = shipping_data.get('order_id', 'UNKNOWN')[:8].upper()
        status = shipping_data.get('status', 'shipped')
        
        status_emojis = {
            'pending': '⏳',
            'shipped': '📦',
            'in_transit': '🚚',
            'out_for_delivery': '📍',
            'delivered': '✅'
        }
        emoji = status_emojis.get(status, '📦')
        
        return await self._send_email(
            to_email=email,
            subject=f'{emoji} Actualización de envío - Pedido #{order_id}',
            html_content=content,
            email_type='shipping_update',
            user_id=user_id,
            metadata=shipping_data
        )
    
    def _generate_device_order_email(self, data: Dict) -> str:
        """Generate device order confirmation HTML email"""
        order_id = data.get('order_id', 'UNKNOWN')[:8].upper()
        quantity = data.get('quantity', 1)
        colors = data.get('colors', ['Plata'])
        device_style = data.get('device_style', 'adulto')
        shipping = data.get('shipping', {})
        total = data.get('total_amount', 4.95)
        
        colors_list = ", ".join(colors) if isinstance(colors, list) else str(colors)
        style_names = {'juvenil': 'Juvenil', 'adulto': 'Adulto', 'senior': 'Senior'}
        style_display = style_names.get(device_style, 'Estándar')
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f4f4f5; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .card {{ background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                .header {{ background: linear-gradient(135deg, #dc2626 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 16px 16px 0 0; margin: -32px -32px 24px -32px; }}
                .order-box {{ background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0; }}
                .detail-row {{ display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }}
                .detail-row:last-child {{ border-bottom: none; font-weight: bold; color: #10b981; font-size: 18px; }}
                .shipping-box {{ background: #ecfdf5; border: 1px solid #86efac; border-radius: 12px; padding: 20px; margin: 20px 0; }}
                .badge {{ display: inline-block; background: #fef3c7; color: #92400e; padding: 6px 14px; border-radius: 16px; font-size: 12px; font-weight: bold; }}
                .btn {{ display: inline-block; background: #dc2626; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; }}
                .footer {{ text-align: center; color: #71717a; font-size: 12px; margin-top: 32px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <div class="header">
                        <h1 style="margin: 0;">🛡️ ManoProtect</h1>
                        <p style="margin: 8px 0 0 0; opacity: 0.9;">¡Gracias por tu pedido!</p>
                    </div>
                    
                    <div style="text-align: center; margin-bottom: 24px;">
                        <span class="badge">Pedido #{order_id}</span>
                    </div>
                    
                    <p style="color: #374151;">
                        Hemos recibido tu pedido correctamente. A continuación te mostramos los detalles:
                    </p>
                    
                    <div class="order-box">
                        <h3 style="margin: 0 0 16px 0; color: #1f2937;">📦 Detalles del Pedido</h3>
                        <div class="detail-row">
                            <span>Dispositivos SOS</span>
                            <span>{quantity}x unidad(es)</span>
                        </div>
                        <div class="detail-row">
                            <span>Estilo</span>
                            <span>{style_display}</span>
                        </div>
                        <div class="detail-row">
                            <span>Colores</span>
                            <span>{colors_list}</span>
                        </div>
                        <div class="detail-row">
                            <span>Dispositivos</span>
                            <span style="text-decoration: line-through; color: #9ca3af;">{quantity * 49}€</span>
                            <span style="color: #10b981; font-weight: bold;">GRATIS</span>
                        </div>
                        <div class="detail-row">
                            <span>Envío Express 24-48h</span>
                            <span>€{total:.2f}</span>
                        </div>
                    </div>
                    
                    <div class="shipping-box">
                        <h3 style="margin: 0 0 16px 0; color: #166534;">🚚 Dirección de Envío</h3>
                        <p style="margin: 0; color: #15803d;">
                            <strong>{shipping.get('fullName', '')}</strong><br>
                            {shipping.get('address', '')}<br>
                            {shipping.get('postalCode', '')} {shipping.get('city', '')}<br>
                            {shipping.get('province', '')}<br>
                            Tel: {shipping.get('phone', '')}
                        </p>
                    </div>
                    
                    <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 20px 0;">
                        <p style="margin: 0; color: #92400e; text-align: center;">
                            📬 <strong>Envío Express 24-48h:</strong> Recibirás tu dispositivo en un plazo de 24 a 48 horas laborables.
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 32px;">
                        <a href="https://manoprotect.com/servicios-sos" class="btn">Ver mi pedido</a>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Si tienes alguna pregunta, contacta con nosotros:</p>
                    <p>📞 601 510 950 | ✉️ soporte@manoprotect.com</p>
                    <p>© 2026 ManoProtect - STARTBOOKING SL - CIF: B19427723</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _generate_shipping_update_email(self, data: Dict) -> str:
        """Generate shipping status update HTML email"""
        order_id = data.get('order_id', 'UNKNOWN')[:8].upper()
        status = data.get('status', 'shipped')
        tracking_number = data.get('tracking_number', '')
        carrier = data.get('carrier', '')
        estimated_delivery = data.get('estimated_delivery', '')
        
        status_info = {
            'pending': ('⏳', 'Preparando tu pedido', '#f59e0b', 'Estamos preparando tu dispositivo SOS para el envío.'),
            'shipped': ('📦', '¡Tu pedido ha sido enviado!', '#3b82f6', 'Tu dispositivo SOS ya está en camino.'),
            'in_transit': ('🚚', 'En tránsito', '#8b5cf6', 'Tu paquete está en camino hacia ti.'),
            'out_for_delivery': ('📍', 'En reparto', '#f97316', '¡Tu paquete está en reparto! Llegará hoy.'),
            'delivered': ('✅', '¡Entregado!', '#10b981', 'Tu dispositivo SOS ha sido entregado.')
        }
        
        emoji, title, color, description = status_info.get(status, ('📦', 'Actualización', '#6b7280', 'Estado actualizado.'))
        
        tracking_section = ""
        if tracking_number and carrier:
            tracking_section = f"""
            <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 16px 0; color: #0369a1;">📍 Información de Seguimiento</h3>
                <p style="margin: 0; color: #0c4a6e;">
                    <strong>Transportista:</strong> {carrier}<br>
                    <strong>Número de seguimiento:</strong> {tracking_number}
                    {f'<br><strong>Entrega estimada:</strong> {estimated_delivery}' if estimated_delivery else ''}
                </p>
            </div>
            """
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f4f4f5; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .card {{ background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                .header {{ background: linear-gradient(135deg, #dc2626 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 16px 16px 0 0; margin: -32px -32px 24px -32px; }}
                .status-badge {{ display: inline-block; background: {color}; color: white; padding: 12px 24px; border-radius: 24px; font-size: 18px; font-weight: bold; }}
                .footer {{ text-align: center; color: #71717a; font-size: 12px; margin-top: 32px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <div class="header">
                        <h1 style="margin: 0;">🛡️ ManoProtect</h1>
                        <p style="margin: 8px 0 0 0; opacity: 0.9;">{emoji} {title}</p>
                    </div>
                    
                    <div style="text-align: center; margin: 24px 0;">
                        <span class="status-badge">{emoji} {title}</span>
                    </div>
                    
                    <p style="color: #374151; text-align: center; font-size: 16px;">
                        {description}
                    </p>
                    
                    <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
                        <p style="margin: 0; color: #6b7280;">Pedido</p>
                        <p style="margin: 4px 0 0 0; font-size: 20px; font-weight: bold; color: #1f2937;">#{order_id}</p>
                    </div>
                    
                    {tracking_section}
                    
                    <p style="color: #6b7280; text-align: center; margin-top: 24px;">
                        Si tienes alguna pregunta sobre tu envío, no dudes en contactarnos.
                    </p>
                </div>
                
                <div class="footer">
                    <p>📞 601 510 950 | ✉️ soporte@manoprotect.com</p>
                    <p>© 2026 ManoProtect - STARTBOOKING SL - CIF: B19427723</p>
                </div>
            </div>
        </body>
        </html>
        """

    # ============================================
    # EMPLOYEE INVITATION EMAIL METHODS
    # ============================================
    
    async def send_employee_invite(
        self,
        email: str,
        invite_data: Dict
    ) -> Dict:
        """Send employee invitation email with registration link and temporary credentials"""
        content = self._generate_employee_invite_email(invite_data)
        
        return await self._send_email(
            to_email=email,
            subject=f'🏢 ManoProtect: Invitación para unirte al equipo',
            html_content=content,
            email_type='employee_invite',
            user_id=invite_data.get('invite_id', ''),
            metadata=invite_data
        )
    
    def _generate_employee_invite_email(self, data: Dict) -> str:
        """Generate employee invitation HTML email"""
        name = data.get('name', 'Nuevo empleado')
        role = data.get('role', 'employee')
        department = data.get('department', 'General')
        temp_password = data.get('temp_password', '')
        registration_url = data.get('registration_url', '')
        expires_at = data.get('expires_at', '7 días')
        invited_by = data.get('invited_by_name', 'Director General')
        
        role_names = {
            'director': 'Director General',
            'manager': 'Manager',
            'soporte': 'Soporte al Cliente',
            'analista_fraude': 'Analista de Fraude',
            'ventas': 'Ventas',
            'logistica': 'Logística',
            'marketing': 'Marketing',
            'employee': 'Empleado'
        }
        role_display = role_names.get(role, role.capitalize())
        
        full_url = f"https://manoprotect.com{registration_url}" if registration_url.startswith('/') else registration_url
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f4f4f5; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .card {{ background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                .header {{ background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 16px 16px 0 0; margin: -32px -32px 24px -32px; }}
                .badge {{ display: inline-block; background: #10b981; color: white; padding: 8px 20px; border-radius: 24px; font-weight: bold; }}
                .info-box {{ background: #f0f9ff; border: 2px solid #bae6fd; padding: 20px; border-radius: 12px; margin: 24px 0; }}
                .credentials-box {{ background: #fef3c7; border: 2px dashed #f59e0b; padding: 20px; border-radius: 12px; margin: 24px 0; text-align: center; }}
                .password {{ font-family: monospace; font-size: 24px; letter-spacing: 2px; color: #92400e; background: white; padding: 10px 20px; border-radius: 8px; display: inline-block; }}
                .btn {{ display: inline-block; background: #4f46e5; color: white; padding: 16px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; }}
                .detail-row {{ display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }}
                .detail-row:last-child {{ border-bottom: none; }}
                .footer {{ text-align: center; color: #71717a; font-size: 12px; margin-top: 32px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <div class="header">
                        <h1 style="margin: 0;">🏢 ManoProtect</h1>
                        <p style="margin: 8px 0 0 0; opacity: 0.9;">Portal de Empleados</p>
                    </div>
                    
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h2 style="color: #1f2937; margin: 0;">¡Bienvenido al equipo, {name}!</h2>
                        <p style="color: #6b7280; margin-top: 8px;">{invited_by} te ha invitado a unirte a ManoProtect</p>
                    </div>
                    
                    <div class="info-box">
                        <h3 style="margin: 0 0 16px 0; color: #0369a1;">📋 Detalles de tu cuenta</h3>
                        <div class="detail-row">
                            <span style="color: #6b7280;">Rol asignado</span>
                            <span style="font-weight: bold; color: #1f2937;">{role_display}</span>
                        </div>
                        <div class="detail-row">
                            <span style="color: #6b7280;">Departamento</span>
                            <span style="font-weight: bold; color: #1f2937;">{department or 'Por asignar'}</span>
                        </div>
                    </div>
                    
                    <div class="credentials-box">
                        <h3 style="margin: 0 0 12px 0; color: #92400e;">🔑 Tu contraseña temporal</h3>
                        <div class="password">{temp_password}</div>
                        <p style="margin: 12px 0 0 0; color: #b45309; font-size: 14px;">
                            Guarda esta contraseña. La necesitarás para completar tu registro.
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="{full_url}" class="btn">
                            Completar mi registro
                        </a>
                    </div>
                    
                    <div style="background: #fef2f2; border-radius: 8px; padding: 16px; margin: 20px 0;">
                        <p style="margin: 0; color: #991b1b; text-align: center; font-size: 14px;">
                            ⏰ <strong>Esta invitación expira:</strong> {expires_at}<br>
                            Completa tu registro antes de esa fecha.
                        </p>
                    </div>
                    
                    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 24px;">
                        <p style="color: #6b7280; font-size: 14px; margin: 0;">
                            <strong>Pasos para registrarte:</strong>
                        </p>
                        <ol style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0; padding-left: 20px;">
                            <li>Haz clic en "Completar mi registro"</li>
                            <li>Introduce tu contraseña temporal</li>
                            <li>Crea tu contraseña permanente</li>
                            <li>¡Listo! Ya tendrás acceso al portal</li>
                        </ol>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Este email fue enviado por ManoProtect<br>
                    STARTBOOKING SL - CIF: B19427723</p>
                    <p>Si no esperabas esta invitación, puedes ignorar este email.</p>
                </div>
            </div>
        </body>
        </html>
        """

    # ============================================
    # 2FA SECURITY ALERT EMAIL METHODS
    # ============================================
    
    async def send_2fa_login_alert(
        self,
        employee_id: str,
        email: str,
        login_data: Dict
    ) -> Dict:
        """Send security alert when 2FA login attempt from new device/IP"""
        content = self._generate_2fa_login_alert_email(login_data)
        
        return await self._send_email(
            to_email=email,
            subject='🔐 Alerta de Seguridad: Nuevo acceso a tu cuenta - ManoProtect',
            html_content=content,
            email_type='2fa_login_alert',
            user_id=employee_id,
            metadata=login_data
        )
    
    async def send_2fa_enabled_confirmation(
        self,
        employee_id: str,
        email: str,
        employee_name: str
    ) -> Dict:
        """Send confirmation when 2FA is enabled"""
        content = self._generate_2fa_enabled_email(employee_name)
        
        return await self._send_email(
            to_email=email,
            subject='✅ 2FA Activado - Tu cuenta está más segura - ManoProtect',
            html_content=content,
            email_type='2fa_enabled',
            user_id=employee_id,
            metadata={"employee_name": employee_name}
        )
    
    def _generate_2fa_login_alert_email(self, data: Dict) -> str:
        """Generate 2FA login alert HTML email"""
        employee_name = data.get('employee_name', 'Usuario')
        ip_address = data.get('ip_address', 'Desconocida')
        user_agent = data.get('user_agent', 'Desconocido')
        location = data.get('location', 'España')
        timestamp = data.get('timestamp', datetime.now(timezone.utc).strftime('%d/%m/%Y %H:%M'))
        is_new_ip = data.get('is_new_ip', False)
        is_new_device = data.get('is_new_device', False)
        login_successful = data.get('login_successful', True)
        
        # Determine alert type and color
        if not login_successful:
            alert_color = '#dc2626'  # Red for failed attempts
            alert_icon = '🚨'
            alert_title = 'Intento de acceso fallido'
            alert_message = 'Se ha detectado un intento de acceso fallido a tu cuenta.'
        elif is_new_ip or is_new_device:
            alert_color = '#f59e0b'  # Orange for new device/IP
            alert_icon = '⚠️'
            alert_title = 'Acceso desde nuevo dispositivo'
            alert_message = 'Se ha detectado un acceso exitoso desde un dispositivo o ubicación no reconocida.'
        else:
            alert_color = '#10b981'  # Green for recognized device
            alert_icon = '✅'
            alert_title = 'Acceso verificado'
            alert_message = 'Se ha iniciado sesión correctamente con verificación 2FA.'
        
        new_indicators = []
        if is_new_ip:
            new_indicators.append('🆕 Nueva dirección IP')
        if is_new_device:
            new_indicators.append('🆕 Nuevo dispositivo/navegador')
        
        indicators_html = ""
        if new_indicators:
            indicators_html = f"""
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 12px; border-radius: 8px; margin: 16px 0;">
                {'<br>'.join(new_indicators)}
            </div>
            """
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f4f4f5; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .card {{ background: white; border-radius: 16px; padding: 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }}
                .header {{ background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 30px; text-align: center; }}
                .logo {{ color: white; font-size: 28px; font-weight: bold; }}
                .alert-badge {{ display: inline-block; background: {alert_color}; color: white; padding: 12px 24px; border-radius: 24px; font-weight: bold; margin-top: 16px; }}
                .content {{ padding: 32px; }}
                .detail-box {{ background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0; }}
                .detail-row {{ display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }}
                .detail-row:last-child {{ border-bottom: none; }}
                .warning-box {{ background: #fef2f2; border: 2px solid #fca5a5; padding: 20px; border-radius: 12px; margin: 24px 0; }}
                .btn {{ display: inline-block; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 4px; }}
                .btn-danger {{ background: #dc2626; color: white; }}
                .btn-secondary {{ background: #6b7280; color: white; }}
                .footer {{ text-align: center; color: #71717a; font-size: 12px; padding: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <div class="header">
                        <div class="logo">🛡️ ManoProtect</div>
                        <p style="color: #94a3b8; margin: 8px 0 0 0;">Portal Enterprise - Alerta de Seguridad</p>
                        <div class="alert-badge">{alert_icon} {alert_title}</div>
                    </div>
                    
                    <div class="content">
                        <p style="color: #374151; font-size: 16px;">
                            Hola <strong>{employee_name}</strong>,
                        </p>
                        <p style="color: #6b7280;">
                            {alert_message}
                        </p>
                        
                        {indicators_html}
                        
                        <div class="detail-box">
                            <h3 style="margin: 0 0 16px 0; color: #1f2937;">📋 Detalles del acceso</h3>
                            <div class="detail-row">
                                <span style="color: #6b7280;">Fecha y hora</span>
                                <strong>{timestamp} (UTC)</strong>
                            </div>
                            <div class="detail-row">
                                <span style="color: #6b7280;">Dirección IP</span>
                                <strong>{ip_address}</strong>
                            </div>
                            <div class="detail-row">
                                <span style="color: #6b7280;">Dispositivo</span>
                                <strong style="font-size: 13px;">{user_agent[:50]}...</strong>
                            </div>
                            <div class="detail-row">
                                <span style="color: #6b7280;">Verificación 2FA</span>
                                <strong style="color: #10b981;">✓ Verificado</strong>
                            </div>
                        </div>
                        
                        <div class="warning-box">
                            <h3 style="margin: 0 0 12px 0; color: #991b1b;">⚠️ ¿No reconoces este acceso?</h3>
                            <p style="margin: 0; color: #7f1d1d;">
                                Si no has sido tú quien ha iniciado sesión, tu cuenta podría estar comprometida. 
                                Te recomendamos:
                            </p>
                            <ol style="color: #7f1d1d; margin: 12px 0 0 0; padding-left: 20px;">
                                <li>Cambiar tu contraseña inmediatamente</li>
                                <li>Regenerar tus códigos de respaldo 2FA</li>
                                <li>Contactar con el equipo de IT</li>
                            </ol>
                        </div>
                        
                        <div style="text-align: center; margin-top: 24px;">
                            <a href="https://secure-gateway-33.preview.emergentagent.com/enterprise" class="btn btn-secondary">Ir al Portal</a>
                            <a href="mailto:it@manoprotect.com?subject=Alerta%20de%20Seguridad%20-%20Acceso%20no%20reconocido" class="btn btn-danger">Reportar acceso sospechoso</a>
                        </div>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Este email fue enviado automáticamente por ManoProtect<br>
                    STARTBOOKING SL - CIF: B19427723</p>
                    <p style="margin-top: 12px;">
                        Si no reconoces esta actividad, contacta inmediatamente con IT:<br>
                        📞 601 510 950 | ✉️ it@manoprotect.com
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _generate_2fa_enabled_email(self, employee_name: str) -> str:
        """Generate 2FA enabled confirmation HTML email"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #ecfdf5; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .card {{ background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                .header {{ text-align: center; margin-bottom: 24px; }}
                .success-icon {{ font-size: 64px; margin-bottom: 16px; }}
                .badge {{ display: inline-block; background: #10b981; color: white; padding: 8px 20px; border-radius: 24px; font-weight: bold; }}
                .tips-box {{ background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 20px; margin: 24px 0; }}
                .btn {{ display: inline-block; background: #10b981; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; }}
                .footer {{ text-align: center; color: #71717a; font-size: 12px; margin-top: 32px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <div class="header">
                        <div class="success-icon">🔐</div>
                        <h1 style="margin: 0; color: #1f2937;">¡2FA Activado!</h1>
                        <p style="color: #6b7280; margin-top: 8px;">Tu cuenta ahora está más segura</p>
                    </div>
                    
                    <div style="text-align: center; margin: 24px 0;">
                        <span class="badge">✓ PROTECCIÓN ACTIVA</span>
                    </div>
                    
                    <p style="color: #374151;">
                        Hola <strong>{employee_name}</strong>,
                    </p>
                    <p style="color: #6b7280;">
                        Has activado correctamente la autenticación de dos factores (2FA) en tu cuenta del Portal Enterprise de ManoProtect.
                    </p>
                    
                    <div class="tips-box">
                        <h3 style="margin: 0 0 16px 0; color: #166534;">📋 Recuerda:</h3>
                        <ul style="color: #15803d; margin: 0; padding-left: 20px;">
                            <li style="margin-bottom: 8px;">Guarda tus códigos de respaldo en un lugar seguro</li>
                            <li style="margin-bottom: 8px;">Necesitarás tu app autenticadora cada vez que inicies sesión</li>
                            <li style="margin-bottom: 8px;">Los códigos cambian cada 30 segundos</li>
                            <li>Si pierdes acceso a tu app, usa un código de respaldo</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin-top: 32px;">
                        <a href="https://secure-gateway-33.preview.emergentagent.com/enterprise" class="btn">Ir al Portal</a>
                    </div>
                </div>
                
                <div class="footer">
                    <p>ManoProtect - Portal Enterprise<br>
                    STARTBOOKING SL - CIF: B19427723</p>
                </div>
            </div>
        </body>
        </html>
        """


# Global instance
email_service = EmailNotificationService()
