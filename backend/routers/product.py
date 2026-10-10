from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models.product import Product
from schemas.product import (
    GoodsReceiptRequest,
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)
from security import get_current_admin


# =========================
# PRODUCT MANAGEMENT
# =========================

router = APIRouter(
    prefix="/products",
    tags=["Product Management"],
    dependencies=[Depends(get_current_admin)]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================
# GET ALL PRODUCTS
# ONLY ADMIN
# =========================

@router.get("/", response_model=list[ProductResponse])
def get_products(
    db: Session = Depends(get_db),
    
):
    products = db.query(Product).all()

    return products


@router.post("/receive", response_model=list[ProductResponse])
def receive_products(
    data: GoodsReceiptRequest,
    db: Session = Depends(get_db),
):
    updated_products = []

    try:
        for item in data.items:
            if item.product_id is not None:
                product = (
                    db.query(Product)
                    .filter(Product.id == item.product_id)
                    .with_for_update()
                    .first()
                )

                if not product:
                    raise HTTPException(status_code=404, detail="Product not found")

                product.stock += item.quantity
                if item.purchase_price is not None:
                    product.purchase_price = item.purchase_price
            else:
                existing_product = (
                    db.query(Product)
                    .filter(Product.barcode == item.barcode)
                    .first()
                )
                if existing_product:
                    raise HTTPException(
                        status_code=409,
                        detail=f"Barcode already exists: {item.barcode}",
                    )

                product = Product(
                    barcode=item.barcode,
                    name=item.name,
                    category=item.category,
                    selling_price=0,
                    purchase_price=item.purchase_price or 0,
                    stock=item.quantity,
                    image=None,
                )
                db.add(product)

            db.flush()
            updated_products.append(product)

        db.commit()
        for product in updated_products:
            db.refresh(product)

        return updated_products
    except Exception:
        db.rollback()
        raise


# =========================
# CREATE PRODUCT
# ONLY ADMIN
# =========================

@router.post("/", response_model=ProductResponse)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    
):
    existing_product = db.query(Product).filter(
        Product.barcode == data.barcode
    ).first()

    if existing_product:
        raise HTTPException(status_code=409, detail="Barcode already exists")

    new_product = Product(
        barcode=data.barcode,
        name=data.name,
        category=data.category,
        selling_price=data.selling_price,
        purchase_price=data.purchase_price,
        stock=data.stock,
        image=data.image
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product



# =========================
# UPDATE PRODUCT
# ONLY ADMIN
# =========================

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    
):
    print("DATA YANG DITERIMA:", data.model_dump(exclude_unset=True))

    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if data.barcode is not None:
        existing_product = db.query(Product).filter(
            Product.barcode == data.barcode,
            Product.id != product_id
        ).first()

        if existing_product:
            raise HTTPException(status_code=409, detail="Barcode already exists")

        product.barcode = data.barcode

    if data.name is not None:
        product.name = data.name

    if data.category is not None:
        product.category = data.category

    if data.selling_price is not None:
        product.selling_price = data.selling_price

    if data.purchase_price is not None:
        product.purchase_price = data.purchase_price

    if data.stock is not None:
        product.stock = data.stock

    if data.image is not None:
        product.image = data.image

    if data.is_active is not None:
        product.is_active = data.is_active

    db.commit()
    db.refresh(product)

    return product


# =========================
# DEACTIVATE PRODUCT
# =========================

@router.put("/{product_id}/deactivate")
def deactivate_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.is_active = False

    db.commit()
    db.refresh(product)

    return {
        "message": "Product deactivated successfully",
        "id": product.id,
        "name": product.name,
        "is_active": product.is_active
    }

# =========================
# ACTIVATE PRODUCT
# =========================

@router.put("/{product_id}/activate")
def activate_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.is_active = True

    db.commit()
    db.refresh(product)

    return {
        "message": "Product activated successfully",
        "id": product.id,
        "name": product.name,
        "is_active": product.is_active
    }