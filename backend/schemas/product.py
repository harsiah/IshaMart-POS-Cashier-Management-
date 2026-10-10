from pydantic import BaseModel, Field, field_validator, model_validator
from decimal import Decimal
from datetime import datetime


# =========================
# CREATE PRODUCT
# =========================

class ProductCreate(BaseModel):
    barcode: str
    name: str
    category: str | None = None
    selling_price: Decimal = 0
    purchase_price: Decimal = 0
    stock: int = 0
    image: str | None = None


# =========================
# UPDATE PRODUCT
# =========================

class ProductUpdate(BaseModel):
    barcode: str | None = None
    name: str | None = None
    category: str | None = None
    selling_price: Decimal | None = None
    purchase_price: Decimal | None = None
    stock: int | None = None
    image: str | None = None
    is_active: bool | None = None

    class Config:
        json_schema_extra = {
            "example": {
                "selling_price": 95000,
                "purchase_price": 70000
            }
        }


# =========================
# PRODUCT RESPONSE
# =========================

class ProductResponse(BaseModel):
    id: int
    barcode: str
    name: str
    category: str | None
    selling_price: Decimal
    purchase_price: Decimal
    stock: int
    image: str | None
    is_active: bool
    created_at: datetime | None
    updated_at: datetime | None

    class Config:
        from_attributes = True


class GoodsReceiptItem(BaseModel):
    product_id: int | None = Field(default=None, gt=0)
    barcode: str | None = None
    name: str | None = None
    category: str | None = None
    purchase_price: Decimal | None = Field(default=None, ge=0)
    quantity: int = Field(gt=0)

    @field_validator("barcode", "name", "category")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        normalized = value.strip()
        return normalized or None

    @model_validator(mode="after")
    def validate_new_product_fields(self):
        if self.product_id is None and (not self.barcode or not self.name):
            raise ValueError("New products require a barcode and name")

        return self


class GoodsReceiptRequest(BaseModel):
    items: list[GoodsReceiptItem] = Field(min_length=1)