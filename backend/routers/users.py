from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pwdlib import PasswordHash

from database import SessionLocal
from models.user import User
from schemas.user import UserCreate, UserUpdate, UserResponse
from security import get_current_admin


# User Management
router = APIRouter(
    prefix="/users",
    tags=["User Management"]
)

password_hash = PasswordHash.recommended()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================
# GET ALL USERS
# ONLY ADMIN
# =========================

@router.get("/", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    users = db.query(User).all()

    return users


# =========================
# CREATE NEW USER
# =========================

@router.post("/")
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    existing_user = db.query(User).filter(
        User.username == data.username
    ).first()

    if existing_user:
        return {
            "message": "Username already exists"
        }

    new_user = User(
        username=data.username,
        password=password_hash.hash(data.password),
        role=data.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created successfully",
        "id": new_user.id,
        "username": new_user.username,
        "role": new_user.role
    }


# =========================
# UPDATE USER
# =========================

@router.put("/{user_id}")
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        return {
            "message": "User not found"
        }

    if data.username is not None:
        existing_user = db.query(User).filter(
            User.username == data.username,
            User.id != user_id
        ).first()

        if existing_user:
            return {
                "message": "Username already exists"
            }

        user.username = data.username

    if data.password is not None:
        user.password = password_hash.hash(
            data.password
        )

    if data.role is not None:
        user.role = data.role

    db.commit()
    db.refresh(user)

    return {
        "message": "User updated successfully",
        "id": user.id,
        "username": user.username,
        "role": user.role
    }


# =========================
# DEACTIVATE USER
# =========================

@router.put("/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        return {
            "message": "User not found"
        }

    user.is_active = False

    db.commit()
    db.refresh(user)

    return {
        "message": "User deactivated successfully",
        "id": user.id,
        "username": user.username,
        "is_active": user.is_active
    }


# =========================
# ACTIVATE USER
# =========================

@router.put("/{user_id}/activate")
def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        return {
            "message": "User not found"
        }

    user.is_active = True

    db.commit()
    db.refresh(user)

    return {
        "message": "User activated successfully",
        "id": user.id,
        "username": user.username,
        "is_active": user.is_active
    }