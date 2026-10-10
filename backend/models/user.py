from sqlalchemy import Column, Integer, String, Boolean, DateTime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="cashier")
    is_active = Column(Boolean, nullable=False, default=True)
    last_active_at = Column(DateTime(timezone=True), nullable=True)