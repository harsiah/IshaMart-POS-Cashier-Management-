from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from database import engine, Base
from routers.auth import router as auth_router
from models.user import User
from routers.users import router as users_router
from models.product import Product
from routers.product import router as products_router
from models.good_receipt import GoodReceipt, GoodReceiptItem
from routers.good_receipt import router as good_receipt_router

app = FastAPI(title="IshaMart POS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(products_router)
app.include_router(good_receipt_router)

print(Base.metadata.tables.keys())

Base.metadata.create_all(bind=engine)

with engine.begin() as connection:
    connection.execute(text(
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE"
    ))
    connection.execute(text(
        "ALTER TABLE good_receipt_items ADD COLUMN IF NOT EXISTS name VARCHAR(255)"
    ))
    connection.execute(text(
        """
        UPDATE good_receipt_items AS receipt_item
        SET name = product.name
        FROM products AS product
        WHERE receipt_item.product_id = product.id
          AND receipt_item.name IS NULL
        """
    ))
    connection.execute(text(
        "ALTER TABLE good_receipt_items ALTER COLUMN name SET NOT NULL"
    ))


@app.get("/health")
def health_check():
    try:
        with engine.connect() as connection:
            return {
                "status": "ok",
                "database": "connected"
            }
    except Exception as e:
        return {
            "status": "error",
            "database": "not connected",
            "detail": str(e)
        }