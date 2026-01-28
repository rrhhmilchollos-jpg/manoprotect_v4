"""
Zoom Video SDK Service for KYC Video Verification
Generates JWT tokens for browser-based video calls without requiring Zoom app download
"""
import os
import jwt
import time
import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any

# Zoom Video SDK credentials from environment
ZOOM_SDK_KEY = os.environ.get("ZOOM_SDK_KEY", "")
ZOOM_SDK_SECRET = os.environ.get("ZOOM_SDK_SECRET", "")
ZOOM_API_KEY = os.environ.get("ZOOM_API_KEY", "")
ZOOM_API_SECRET = os.environ.get("ZOOM_API_SECRET", "")


def generate_video_sdk_token(
    session_name: str,
    role: int = 0,
    user_identity: str = "",
    expiration_seconds: int = 7200  # 2 hours default
) -> str:
    """
    Generate JWT token for Zoom Video SDK session
    
    Args:
        session_name: Unique session identifier (topic name)
        role: 0 for participant (customer), 1 for host (agent)
        user_identity: Unique identifier for the user
        expiration_seconds: Token validity in seconds
    
    Returns:
        JWT token string for Zoom Video SDK
    """
    if not ZOOM_SDK_KEY or not ZOOM_SDK_SECRET:
        raise ValueError("Zoom SDK credentials not configured. Please set ZOOM_SDK_KEY and ZOOM_SDK_SECRET in .env")
    
    now = int(time.time())
    
    # Zoom Video SDK JWT payload
    payload = {
        "app_key": ZOOM_SDK_KEY,
        "tpc": session_name,  # Topic/session name
        "role_type": role,  # 0 = participant, 1 = host
        "version": 1,
        "iat": now,
        "exp": now + expiration_seconds,
    }
    
    # Add user identity if provided
    if user_identity:
        payload["user_identity"] = user_identity
    
    # Sign token with SDK Secret
    token = jwt.encode(
        payload,
        ZOOM_SDK_SECRET,
        algorithm="HS256"
    )
    
    return token


def create_kyc_session(
    customer_id: str,
    customer_name: str,
    request_id: str
) -> Dict[str, Any]:
    """
    Create a new KYC video verification session
    
    Args:
        customer_id: Customer's unique ID
        customer_name: Customer's display name
        request_id: Account opening request ID
    
    Returns:
        Dict with session details and tokens
    """
    # Generate unique session name
    session_id = f"kyc_{uuid.uuid4().hex[:12]}"
    session_name = f"manobank_kyc_{request_id}"
    
    # Generate tokens for both parties
    customer_token = generate_video_sdk_token(
        session_name=session_name,
        role=0,  # Participant
        user_identity=customer_id,
        expiration_seconds=3600  # 1 hour for customer
    )
    
    # Agent token will be generated when agent joins
    # We store session info for later agent token generation
    
    return {
        "session_id": session_id,
        "session_name": session_name,
        "customer_token": customer_token,
        "customer_display_name": customer_name,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "waiting_customer"  # waiting_customer, customer_joined, agent_joined, in_progress, completed, failed
    }


def generate_agent_token(
    session_name: str,
    agent_id: str,
    agent_name: str
) -> str:
    """
    Generate token for bank agent to join KYC session
    
    Args:
        session_name: The session name from create_kyc_session
        agent_id: Agent's unique ID
        agent_name: Agent's display name
    
    Returns:
        JWT token for agent
    """
    return generate_video_sdk_token(
        session_name=session_name,
        role=1,  # Host (agent has control)
        user_identity=agent_id,
        expiration_seconds=7200  # 2 hours for agent
    )


def is_zoom_configured() -> bool:
    """Check if Zoom SDK credentials are configured"""
    return bool(ZOOM_SDK_KEY and ZOOM_SDK_SECRET)


def get_zoom_config_status() -> Dict[str, Any]:
    """Get Zoom SDK configuration status"""
    return {
        "sdk_key_configured": bool(ZOOM_SDK_KEY),
        "sdk_secret_configured": bool(ZOOM_SDK_SECRET),
        "api_key_configured": bool(ZOOM_API_KEY),
        "api_secret_configured": bool(ZOOM_API_SECRET),
        "is_ready": is_zoom_configured()
    }
