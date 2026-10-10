from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    Date,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


# ==========================================
# GOOD RECEIPT
# ==========================================

class GoodReceipt(Base):
    __tablename__ = "good_receipts"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    gr_number = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    receipt_date = Column(
        Date,
        nullable=False
    )

    supplier = Column(
        String,
        nullable=False
    )

    invoice_number = Column(
        String,
        nullable=True
    )

    notes = Column(
        Text,
        nullable=True
    )

    status = Column(
        String,
        nullable=False,
        default="Received"
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

    # Relationship ke item GR
    items = relationship(
        "GoodReceiptItem",
        back_populates="receipt",
        cascade="all, delete-orphan"
    )


# ==========================================
# GOOD RECEIPT ITEM
# ==========================================

class GoodReceiptItem(Base):
    __tablename__ = "good_receipt_items"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    receipt_id = Column(
        Integer,
        ForeignKey(
            "good_receipts.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    product_id = Column(
        Integer,
        ForeignKey(
            "products.id"
        ),
        nullable=False
    )

    name = Column(
        String(255),
        nullable=False
    )

    quantity = Column(
        Integer,
        nullable=False
    )

    purchase_price = Column(
        Numeric(12, 2),
        nullable=False
    )

    total = Column(
        Numeric(12, 2),
        nullable=False
    )

    # Relationship ke GR
    receipt = relationship(
        "GoodReceipt",
        back_populates="items"
    )

    # Relationship ke Product
    product = relationship(
        "Product"
    )