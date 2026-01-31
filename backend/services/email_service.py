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
FROM_EMAIL = os.environ.get('FROM_EMAIL', 'alertas@mano-security.com')


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




# Global instance
email_service = EmailNotificationService()
