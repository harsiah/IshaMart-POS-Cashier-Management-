from pydantic import BaseModel, Field, field_validator, model_validator
from decimal import Decimal
from datetime import date, datetime


# ==========================================
# GOOD RECEIPT ITEM CREATE
# ==========================================

class GoodReceiptItemCreate(BaseModel):
    product_id: int | None = Field(default=None, gt=0)
    barcode: str | None = None
    name: str | None = None
    category: str | None = None
    quantity: int = Field(gt=0)
    purchase_price: Decimal = Field(ge=0)

    @field_validator("barcode", "name", "category")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        normalized = value.strip()
        return normalized or None

    @model_validator(mode="after")
    def validate_product_reference(self):
        if self.product_id is None and (not self.barcode or not self.name):
            raise ValueError("New products require a barcode and name")

        return self


# ==========================================
# GOOD RECEIPT CREATE
# ==========================================

class GoodReceiptCreate(BaseModel):
    gr_number: str
    receipt_date: date
    supplier: str
    invoice_number: str | None = None
    notes: str | None = None

    items: list[GoodReceiptItemCreate] = Field(min_length=1)


# ==========================================
# GOOD RECEIPT ITEM RESPONSE
# ==========================================

class GoodReceiptItemResponse(BaseModel):
    product_id: int
    name: str
    quantity: int
    purchase_price: Decimal
    total: Decimal

    class Config:
        from_attributes = True


# ==========================================
# GOOD RECEIPT RESPONSE
# ==========================================

class GoodReceiptResponse(BaseModel):
    id: int
    gr_number: str
    receipt_date: date
    supplier: str
    invoice_number: str | None
    notes: str | None
    status: str
    created_at: datetime | None
    updated_at: datetime | None

    items: list[GoodReceiptItemResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True