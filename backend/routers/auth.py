# =========================
# IMPORTS
# =========================

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pwdlib import PasswordHash

from database import SessionLocal
from models.user import User
from schemas.user import LoginRequest
from security import create_access_token


# =========================
# ROUTER CONFIGURATION
# =========================

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# =========================
# PASSWORD HASH
# =========================

password_hash = PasswordHash.recommended()


# =========================
# DATABASE DEPENDENCY
# =========================

def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# =========================
# LOGIN
# =========================

@router.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):

    # =========================
    # FIND USER
    # =========================

    user = db.query(User).filter(
        User.username == data.username
    ).first()


    # =========================
    # CHECK USER EXISTS
    # =========================

    if not user:
        return {
            "message": "Invalid username or password"
        }


    # =========================
    # CHECK USER ACTIVE
    # =========================

    if not user.is_active:
        return {
            "message": "User account is inactive"
        }


    # =========================
    # VERIFY PASSWORD
    # =========================

    if not password_hash.verify(
        data.password,
        user.password
    ):
        return {
            "message": "Invalid username or password"
        }

    user.last_active_at = datetime.now(timezone.utc)
    db.commit()


    # =========================
    # CREATE ACCESS TOKEN
    # =========================

    access_token = create_access_token({
        "sub": str(user.id),
        "username": user.username,
        "role": user.role
    })


    # =========================
    # LOGIN RESPONSE
    # =========================

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username,
        "role": user.role
    }