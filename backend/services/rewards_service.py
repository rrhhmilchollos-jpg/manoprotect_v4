"""
MANO - Rewards and Gamification Service
Points, levels, badges, and achievements system
"""
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timezone, timedelta
from core.config import db
import uuid


class RewardsService:
    """
    Gamification service for user engagement
    Includes points, levels, badges, and leaderboards
    """
    
    def __init__(self):
        # Point values for different actions
        self.point_actions = {
            'analyze_threat': 5,
            'report_threat': 10,
            'report_false_positive': 15,
            'share_alert': 5,
            'daily_login': 2,
            'weekly_streak': 20,
            'monthly_streak': 100,
            'refer_user': 50,
            'complete_profile': 20,
            'enable_notifications': 10,
            'connect_bank': 25,
            'verify_safe': 3,
            'block_threat': 8,
            'help_family': 15,
            'community_alert': 25
        }
        
        # Level thresholds
        self.levels = {
            'bronce': {'min': 0, 'max': 99, 'icon': '🥉', 'name': 'Bronce'},
            'plata': {'min': 100, 'max': 499, 'icon': '🥈', 'name': 'Plata'},
            'oro': {'min': 500, 'max': 1999, 'icon': '🥇', 'name': 'Oro'},
            'platino': {'min': 2000, 'max': 4999, 'icon': '💎', 'name': 'Platino'},
            'diamante': {'min': 5000, 'max': float('inf'), 'icon': '👑', 'name': 'Diamante'}
        }
        
        # Available badges
        self.badges = {
            'first_analysis': {
                'id': 'first_analysis',
                'name': 'Primer Análisis',
                'description': 'Analiza tu primer contenido sospechoso',
                'icon': '🔍',
                'points': 10
            },
            'threat_hunter': {
                'id': 'threat_hunter',
                'name': 'Cazador de Amenazas',
                'description': 'Detecta 10 amenazas reales',
                'icon': '🎯',
                'points': 50
            },
            'community_guardian': {
                'id': 'community_guardian',
                'name': 'Guardián de la Comunidad',
                'description': 'Reporta 5 amenazas a la comunidad',
                'icon': '🛡️',
                'points': 75
            },
            'family_protector': {
                'id': 'family_protector',
                'name': 'Protector Familiar',
                'description': 'Añade y protege a 3 familiares',
                'icon': '👨‍👩‍👧',
                'points': 100
            },
            'streak_master': {
                'id': 'streak_master',
                'name': 'Maestro de Rachas',
                'description': 'Mantén una racha de 7 días',
                'icon': '🔥',
                'points': 50
            },
            'bank_sentinel': {
                'id': 'bank_sentinel',
                'name': 'Centinela Bancario',
                'description': 'Conecta una cuenta bancaria',
                'icon': '🏦',
                'points': 25
            },
            'early_adopter': {
                'id': 'early_adopter',
                'name': 'Pionero',
                'description': 'Uno de los primeros usuarios',
                'icon': '⭐',
                'points': 100
            },
            'fraud_expert': {
                'id': 'fraud_expert',
                'name': 'Experto en Fraudes',
                'description': 'Detecta 50 amenazas',
                'icon': '🧠',
                'points': 200
            },
            'helpful_neighbor': {
                'id': 'helpful_neighbor',
                'name': 'Vecino Solidario',
                'description': 'Comparte 10 alertas con otros',
                'icon': '🤝',
                'points': 50
            },
            'notification_hero': {
                'id': 'notification_hero',
                'name': 'Héroe de Alertas',
                'description': 'Activa todas las notificaciones',
                'icon': '🔔',
                'points': 15
            }
        }
    
    async def get_user_rewards(self, user_id: str) -> Dict:
        """Get complete rewards data for a user"""
        rewards = await db.user_rewards.find_one(
            {"user_id": user_id},
            {"_id": 0}
        )
        
        if not rewards:
            # Initialize rewards for new user
            rewards = await self._initialize_user_rewards(user_id)
        
        # Calculate level
        level_info = self._get_level_info(rewards.get('total_points', 0))
        
        # Get recent activity
        recent_activity = await db.reward_history.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("created_at", -1).limit(10).to_list(10)
        
        return {
            **rewards,
            "level": level_info,
            "recent_activity": recent_activity,
            "available_badges": self._get_available_badges(rewards.get('badges', []))
        }
    
    async def _initialize_user_rewards(self, user_id: str) -> Dict:
        """Initialize rewards for a new user"""
        rewards = {
            "user_id": user_id,
            "total_points": 0,
            "weekly_points": 0,
            "monthly_points": 0,
            "badges": [],
            "streak_days": 0,
            "last_activity": datetime.now(timezone.utc).isoformat(),
            "achievements": {
                "threats_detected": 0,
                "threats_reported": 0,
                "alerts_shared": 0,
                "family_protected": 0,
                "banks_connected": 0
            },
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.user_rewards.insert_one(rewards)
        
        # Award early adopter badge
        await self.award_badge(user_id, 'early_adopter')
        
        return rewards
    
    async def award_points(
        self,
        user_id: str,
        action: str,
        metadata: Dict = {}
    ) -> Dict:
        """Award points for an action"""
        points = self.point_actions.get(action, 0)
        
        if points == 0:
            return {"success": False, "message": "Acción no válida"}
        
        # Update user rewards
        result = await db.user_rewards.update_one(
            {"user_id": user_id},
            {
                "$inc": {
                    "total_points": points,
                    "weekly_points": points,
                    "monthly_points": points
                },
                "$set": {
                    "last_activity": datetime.now(timezone.utc).isoformat()
                }
            },
            upsert=True
        )
        
        # Record in history
        history_entry = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "action": action,
            "points": points,
            "metadata": metadata,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.reward_history.insert_one(history_entry)
        
        # Check for badge unlocks
        await self._check_badge_unlocks(user_id, action)
        
        # Get updated totals
        updated = await db.user_rewards.find_one(
            {"user_id": user_id},
            {"_id": 0, "total_points": 1}
        )
        
        new_total = updated.get('total_points', points) if updated else points
        level_info = self._get_level_info(new_total)
        
        return {
            "success": True,
            "points_earned": points,
            "total_points": new_total,
            "level": level_info,
            "action": action
        }
    
    async def award_badge(self, user_id: str, badge_id: str) -> Dict:
        """Award a badge to a user"""
        badge = self.badges.get(badge_id)
        if not badge:
            return {"success": False, "message": "Insignia no encontrada"}
        
        # Check if already has badge
        existing = await db.user_rewards.find_one({
            "user_id": user_id,
            "badges": badge_id
        })
        
        if existing:
            return {"success": False, "message": "Ya tienes esta insignia"}
        
        # Award badge and points
        await db.user_rewards.update_one(
            {"user_id": user_id},
            {
                "$push": {"badges": badge_id},
                "$inc": {"total_points": badge['points']}
            },
            upsert=True
        )
        
        # Record in history
        history_entry = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "action": "badge_earned",
            "points": badge['points'],
            "metadata": {"badge_id": badge_id, "badge_name": badge['name']},
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.reward_history.insert_one(history_entry)
        
        return {
            "success": True,
            "badge": badge,
            "points_earned": badge['points'],
            "message": f"¡Has desbloqueado la insignia '{badge['name']}'!"
        }
    
    async def _check_badge_unlocks(self, user_id: str, action: str):
        """Check and unlock badges based on action"""
        rewards = await db.user_rewards.find_one(
            {"user_id": user_id},
            {"_id": 0}
        )
        
        if not rewards:
            return
        
        badges = rewards.get('badges', [])
        achievements = rewards.get('achievements', {})
        
        # Update achievements based on action
        achievement_map = {
            'analyze_threat': 'threats_detected',
            'report_threat': 'threats_reported',
            'share_alert': 'alerts_shared',
            'help_family': 'family_protected',
            'connect_bank': 'banks_connected'
        }
        
        if action in achievement_map:
            field = achievement_map[action]
            await db.user_rewards.update_one(
                {"user_id": user_id},
                {"$inc": {f"achievements.{field}": 1}}
            )
            achievements[field] = achievements.get(field, 0) + 1
        
        # Check badge conditions
        if 'first_analysis' not in badges and action == 'analyze_threat':
            await self.award_badge(user_id, 'first_analysis')
        
        if 'threat_hunter' not in badges and achievements.get('threats_detected', 0) >= 10:
            await self.award_badge(user_id, 'threat_hunter')
        
        if 'community_guardian' not in badges and achievements.get('threats_reported', 0) >= 5:
            await self.award_badge(user_id, 'community_guardian')
        
        if 'family_protector' not in badges and achievements.get('family_protected', 0) >= 3:
            await self.award_badge(user_id, 'family_protector')
        
        if 'bank_sentinel' not in badges and action == 'connect_bank':
            await self.award_badge(user_id, 'bank_sentinel')
        
        if 'fraud_expert' not in badges and achievements.get('threats_detected', 0) >= 50:
            await self.award_badge(user_id, 'fraud_expert')
        
        if 'helpful_neighbor' not in badges and achievements.get('alerts_shared', 0) >= 10:
            await self.award_badge(user_id, 'helpful_neighbor')
    
    async def update_streak(self, user_id: str) -> Dict:
        """Update user's daily streak"""
        rewards = await db.user_rewards.find_one(
            {"user_id": user_id},
            {"_id": 0}
        )
        
        if not rewards:
            rewards = await self._initialize_user_rewards(user_id)
        
        last_activity = rewards.get('last_activity')
        current_streak = rewards.get('streak_days', 0)
        
        if last_activity:
            last_date = datetime.fromisoformat(last_activity.replace('Z', '+00:00'))
            today = datetime.now(timezone.utc)
            days_diff = (today.date() - last_date.date()).days
            
            if days_diff == 1:
                # Continue streak
                current_streak += 1
            elif days_diff > 1:
                # Streak broken
                current_streak = 1
            # Same day - no change
        else:
            current_streak = 1
        
        # Update streak
        await db.user_rewards.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "streak_days": current_streak,
                    "last_activity": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        # Award streak bonuses
        bonus_points = 0
        if current_streak == 7:
            await self.award_points(user_id, 'weekly_streak')
            bonus_points = self.point_actions['weekly_streak']
            if 'streak_master' not in rewards.get('badges', []):
                await self.award_badge(user_id, 'streak_master')
        elif current_streak == 30:
            await self.award_points(user_id, 'monthly_streak')
            bonus_points = self.point_actions['monthly_streak']
        
        return {
            "streak_days": current_streak,
            "bonus_points": bonus_points
        }
    
    def _get_level_info(self, total_points: int) -> Dict:
        """Get level information based on points"""
        for level_id, level in self.levels.items():
            if level['min'] <= total_points <= level['max']:
                progress = 0
                next_level = None
                points_to_next = 0
                
                if level['max'] != float('inf'):
                    range_size = level['max'] - level['min'] + 1
                    progress = int(((total_points - level['min']) / range_size) * 100)
                    points_to_next = level['max'] - total_points + 1
                    
                    # Find next level
                    levels_list = list(self.levels.keys())
                    current_idx = levels_list.index(level_id)
                    if current_idx < len(levels_list) - 1:
                        next_level = self.levels[levels_list[current_idx + 1]]['name']
                
                return {
                    "id": level_id,
                    "name": level['name'],
                    "icon": level['icon'],
                    "progress": min(progress, 100),
                    "points_to_next": points_to_next,
                    "next_level": next_level
                }
        
        return self.levels['bronce']
    
    def _get_available_badges(self, earned_badges: List[str]) -> List[Dict]:
        """Get badges not yet earned"""
        available = []
        for badge_id, badge in self.badges.items():
            if badge_id not in earned_badges:
                available.append(badge)
        return available
    
    async def get_leaderboard(self, period: str = 'weekly', limit: int = 10) -> List[Dict]:
        """Get leaderboard for specified period"""
        points_field = {
            'weekly': 'weekly_points',
            'monthly': 'monthly_points',
            'all_time': 'total_points'
        }.get(period, 'weekly_points')
        
        pipeline = [
            {"$match": {points_field: {"$gt": 0}}},
            {"$sort": {points_field: -1}},
            {"$limit": limit},
            {"$lookup": {
                "from": "users",
                "localField": "user_id",
                "foreignField": "user_id",
                "as": "user"
            }},
            {"$unwind": {"path": "$user", "preserveNullAndEmptyArrays": True}},
            {"$project": {
                "_id": 0,
                "user_id": 1,
                "name": "$user.name",
                "points": f"${points_field}",
                "badges_count": {"$size": {"$ifNull": ["$badges", []]}},
                "level": 1
            }}
        ]
        
        leaderboard = await db.user_rewards.aggregate(pipeline).to_list(limit)
        
        # Add level info and rank
        for idx, entry in enumerate(leaderboard):
            entry['rank'] = idx + 1
            entry['level'] = self._get_level_info(entry.get('points', 0))
        
        return leaderboard
    
    async def reset_weekly_points(self):
        """Reset weekly points (run via cron)"""
        await db.user_rewards.update_many(
            {},
            {"$set": {"weekly_points": 0}}
        )
    
    async def reset_monthly_points(self):
        """Reset monthly points (run via cron)"""
        await db.user_rewards.update_many(
            {},
            {"$set": {"monthly_points": 0}}
        )


# Global instance
rewards_service = RewardsService()
