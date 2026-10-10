from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime
from sqlalchemy.sql import func

from database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    barcode = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    image = Column(
            String,
            nullable=True
        )


    category = Column(
        String,
        nullable=True
    )

    selling_price = Column(
        Numeric(12, 2),
        nullable=False,
        default=0
    )

    purchase_price = Column(
        Numeric(12, 2),
        nullable=False,
        default=0
    )

    stock = Column(
        Integer,
        nullable=False,
        default=0
    )

    

    is_active = Column(
        Boolean,
        nullable=False,
        default=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )