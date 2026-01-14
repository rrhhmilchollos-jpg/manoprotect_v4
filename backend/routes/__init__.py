# MANO API Routes
from fastapi import APIRouter

# Import all routers
from .auth import router as auth_router
from .admin import router as admin_router
from .investors import router as investors_router
from .threats import router as threats_router
from .banking import router as banking_router
from .payments import router as payments_router
from .rewards import router as rewards_router
from .notifications import router as notifications_router
from .profile import router as profile_router
from .family import router as family_router
from .enterprise import router as enterprise_router

# List of all routers for easy registration
all_routers = [
    auth_router,
    admin_router,
    investors_router,
    threats_router,
    banking_router,
    payments_router,
    rewards_router,
    notifications_router,
    profile_router,
    family_router,
    enterprise_router
]

__all__ = [
    'auth_router',
    'admin_router', 
    'investors_router',
    'threats_router',
    'banking_router',
    'payments_router',
    'rewards_router',
    'notifications_router',
    'profile_router',
    'family_router',
    'enterprise_router',
    'all_routers'
]
