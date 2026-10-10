from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from database import SessionLocal
from models.product import Product
from models.good_receipt import (
    GoodReceipt,
    GoodReceiptItem,
)
from schemas.good_receipt import (
    GoodReceiptCreate,
    GoodReceiptResponse,
)
from security import get_current_admin


# ==========================================
# GOOD RECEIPT ROUTER
# ==========================================

router = APIRouter(
    prefix="/good-receipts",
    tags=["Good Receipt"],
    dependencies=[Depends(get_current_admin)]
)


# ==========================================
# DATABASE
# ==========================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ==========================================
# GET ALL GOOD RECEIPTS
# ==========================================

@router.get(
    "/",
    response_model=list[GoodReceiptResponse]
)
def get_good_receipts(
    db: Session = Depends(get_db)
):

    receipts = (
        db.query(GoodReceipt)
        .options(selectinload(GoodReceipt.items))
        .order_by(
            GoodReceipt.id.desc()
        )
        .all()
    )

    return receipts


# ==========================================
# GET SINGLE GOOD RECEIPT
# ==========================================

@router.get(
    "/{receipt_id}",
    response_model=GoodReceiptResponse
)
def get_good_receipt(
    receipt_id: int,
    db: Session = Depends(get_db)
):

    receipt = (
        db.query(GoodReceipt)
        .options(selectinload(GoodReceipt.items))
        .filter(
            GoodReceipt.id == receipt_id
        )
        .first()
    )

    if not receipt:
        raise HTTPException(
            status_code=404,
            detail="Good Receipt not found"
        )

    return receipt


# ==========================================
# CREATE GOOD RECEIPT
# ==========================================

@router.post(
    "/",
    response_model=GoodReceiptResponse
)
def create_good_receipt(
    data: GoodReceiptCreate,
    db: Session = Depends(get_db)
):

    existing_receipt = (
        db.query(GoodReceipt)
        .filter(
            GoodReceipt.gr_number == data.gr_number
        )
        .first()
    )

    if existing_receipt:
        raise HTTPException(
            status_code=409,
            detail="GR number already exists"
        )

    try:

        # ==================================
        # CREATE GOOD RECEIPT
        # ==================================

        new_receipt = GoodReceipt(
            gr_number=data.gr_number,
            receipt_date=data.receipt_date,
            supplier=data.supplier,
            invoice_number=data.invoice_number,
            notes=data.notes,
            status="Received",
        )

        db.add(new_receipt)
        db.flush()


        # ==================================
        # CREATE RECEIPT ITEMS
        # ==================================

        for item in data.items:

            # ------------------------------
            # EXISTING PRODUCT
            # ------------------------------

            if item.product_id is not None:

                product = (
                    db.query(Product)
                    .filter(
                        Product.id == item.product_id
                    )
                    .with_for_update()
                    .first()
                )

                if not product:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Product ID {item.product_id} not found",
                    )


            # ------------------------------
            # NEW PRODUCT
            # ------------------------------

            else:

                product = (
                    db.query(Product)
                    .filter(
                        Product.barcode == item.barcode
                    )
                    .with_for_update()
                    .first()
                )

                if product:
                    raise HTTPException(
                        status_code=409,
                        detail=f"Barcode already exists: {item.barcode}",
                    )

                product = Product(
                    barcode=item.barcode,
                    name=item.name,
                    category=item.category,
                    selling_price=0,
                    purchase_price=item.purchase_price,
                    stock=0,
                    image=None,
                )

                db.add(product)
                db.flush()


            # ==================================
            # UPDATE PRODUCT STOCK
            # ==================================

            product.stock += item.quantity

            product.purchase_price = item.purchase_price


            # ==================================
            # CREATE GOOD RECEIPT ITEM
            # ==================================

            db.add(
                GoodReceiptItem(
                    receipt_id=new_receipt.id,

                    product_id=product.id,

                    # NEW
                    name=product.name,

                    quantity=item.quantity,

                    purchase_price=item.purchase_price,

                    total=(
                        item.purchase_price *
                        item.quantity
                    ),
                )
            )


        # ==================================
        # SAVE
        # ==================================

        db.commit()

        db.refresh(new_receipt)

        return new_receipt


    except IntegrityError as error:

        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="GR number or product barcode already exists",
        ) from error


    except Exception:

        db.rollback()

        raise