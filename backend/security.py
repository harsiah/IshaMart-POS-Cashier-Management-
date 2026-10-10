# =========================
# IMPORTS
# =========================

import os
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")


# =========================
# JWT CONFIGURATION
# =========================



ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60


# =========================
# HTTP BEARER SECURITY
# =========================

security = HTTPBearer()


# =========================
# CREATE ACCESS TOKEN
# =========================

def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({
        "exp": expire
    })

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# =========================
# VERIFY TOKEN
# =========================

def verify_token(token: str):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except JWTError:
        return None


# =========================
# GET CURRENT USER
# =========================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    payload = verify_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    return payload


# =========================
# jwt ONLY ADMIN CAN ACCESS USER MANAGEMENT
# =========================


def get_current_admin(
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    return current_user


# =========================
# ONLY ADMIN CAN ACCESS MANAGEMENT
# =========================

def get_management_access(
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Management access required"
        )

    return current_user