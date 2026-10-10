from datetime import datetime
from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "cashier"


class UserUpdate(BaseModel):
    username: str | None = None
    password: str | None = None
    role: str | None = None

class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    is_active: bool
    last_active_at: datetime | None = None

    class Config:
        from_attributes = True