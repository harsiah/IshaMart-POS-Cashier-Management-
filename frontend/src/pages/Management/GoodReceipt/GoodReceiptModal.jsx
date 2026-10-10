import React from "react";
import {
  CheckCircle2,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import DateInput from "../../../components/DateInput";

import { PRODUCT_CATEGORIES } from "../../../constants/productCategories";
import { formatCurrency } from "../../../utils/formatters";

function GoodReceiptModal({
  onClose,

  grNumber,
  receiptDate,
  setReceiptDate,

  supplier,
  setSupplier,
  isAddingSupplier,
  setIsAddingSupplier,
  supplierHistory,

  invoiceNumber,
  setInvoiceNumber,

  productSearch,
  setProductSearch,
  searchedProducts,
  productsLoading,
  productsError,

  items,
  addProduct,
  changeQuantity,
  changePurchasePrice,
  removeItem,

  showNewProductForm,
  setShowNewProductForm,
  newProduct,
  setNewProduct,
  addNewProduct,

  notes,
  setNotes,

  totalItems,
  totalPurchaseValue,

  receiveGoods,
  isReceiving,
  receiveError,

  ADD_NEW_SUPPLIER,
}) {
  return (
    <div
      className="good-receipt-modal-backdrop"
      onMouseDown={onClose}
    >
      <div
        className="good-receipt-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        {/* =================================
            MODAL HEADER
        ================================= */}

        <header className="good-receipt-modal-header">

          <div>
            <p>
              INVENTORY RECEIVING
            </p>

            <h2>
              New Good Receipt
            </h2>

            <span>
              Record incoming goods from supplier.
            </span>
          </div>

          <button
            className="good-receipt-close"
            type="button"
            onClick={onClose}
          >
            <X size={17} />
          </button>

        </header>


        {/* =================================
            BASIC INFORMATION
        ================================= */}

        <div className="good-receipt-form">

          {/* GR NUMBER */}

          <div className="good-receipt-form-field">

            <label>
              GR Number
            </label>

            <input
              type="text"
              value={grNumber}
              readOnly
            />

          </div>


          {/* RECEIPT DATE */}

          <DateInput
            label="Receipt Date"
            value={receiptDate}
            onChange={setReceiptDate}
            className="good-receipt-form-field"
          />


          {/* SUPPLIER */}

          <div className="good-receipt-form-field">

            <label>
              Supplier
            </label>

            <select
              value={
                isAddingSupplier
                  ? ADD_NEW_SUPPLIER
                  : supplier
              }
              onChange={(event) => {

                const selectedSupplier =
                  event.target.value;

                const addingSupplier =
                  selectedSupplier ===
                  ADD_NEW_SUPPLIER;

                setIsAddingSupplier(
                  addingSupplier
                );

                setSupplier(
                  addingSupplier
                    ? ""
                    : selectedSupplier
                );

              }}
            >

              <option value="">
                Select supplier from history
              </option>

              {supplierHistory.map(
                (supplierName) => (
                  <option
                    key={supplierName}
                    value={supplierName}
                  >
                    {supplierName}
                  </option>
                )
              )}

              <option value={ADD_NEW_SUPPLIER}>
                Add New Supplier
              </option>

            </select>


            {isAddingSupplier && (
              <input
                type="text"
                placeholder="Enter supplier name"
                value={supplier}
                onChange={(event) =>
                  setSupplier(
                    event.target.value
                  )
                }
                autoFocus
              />
            )}

          </div>


          {/* INVOICE NUMBER */}

          <div className="good-receipt-form-field">

            <label>
              Invoice Number
            </label>

            <input
              type="text"
              placeholder="Supplier invoice number"
              value={invoiceNumber}
              onChange={(event) =>
                setInvoiceNumber(
                  event.target.value
                )
              }
            />

          </div>

        </div>


        {/* =================================
            PRODUCTS
        ================================= */}

        <div className="good-receipt-products">

          <div className="good-receipt-section-heading">

            <div>

              <h3>
                Received Products
              </h3>

              <p>
                Search and add products received
                from supplier.
              </p>

            </div>

          </div>


          {/* PRODUCT SEARCH */}

          <div className="good-receipt-item-search">

            <Search size={15} />

            <input
              type="text"
              placeholder="Search product or scan barcode..."
              value={productSearch}
              onChange={(event) =>
                setProductSearch(
                  event.target.value
                )
              }
            />

          </div>


          {/* PRODUCTS LOADING */}

          {productsLoading && (
            <p className="good-receipt-product-message">
              Loading products...
            </p>
          )}


          {/* PRODUCTS ERROR */}

          {productsError && (
            <p
              className="good-receipt-product-error"
              role="alert"
            >
              Could not load products:{" "}
              {productsError}
            </p>
          )}


          {/* ADD NEW PRODUCT */}

          <button
            type="button"
            className="good-receipt-add-product-toggle"
            onClick={() => {
              setShowNewProductForm(
                (shown) => !shown
              );
            }}
          >
            <Plus size={14} />

            Add New Product
          </button>


          {showNewProductForm && (

            <div className="good-receipt-new-product-form">

              {/* PRODUCT NAME */}

              <label className="good-receipt-new-product-field">

                Product Name

                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(event) =>
                    setNewProduct(
                      (current) => ({
                        ...current,
                        name:
                          event.target.value,
                      })
                    )
                  }
                />

              </label>


              {/* BARCODE */}

              <label className="good-receipt-new-product-field">

                Barcode

                <input
                  type="text"
                  value={newProduct.barcode}
                  onChange={(event) =>
                    setNewProduct(
                      (current) => ({
                        ...current,
                        barcode:
                          event.target.value,
                      })
                    )
                  }
                />

              </label>


              {/* CATEGORY */}

              <label className="good-receipt-new-product-field">

                Category

                <select
                  value={newProduct.category}
                  onChange={(event) =>
                    setNewProduct(
                      (current) => ({
                        ...current,
                        category:
                          event.target.value,
                      })
                    )
                  }
                >

                  <option value="">
                    Select category
                  </option>

                  {PRODUCT_CATEGORIES.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}

                </select>

              </label>


              {/* PURCHASE PRICE */}

              <label className="good-receipt-new-product-field">

                Purchase Price (optional)

                <input
                  type="number"
                  min="0"
                  value={
                    newProduct.purchasePrice
                  }
                  onChange={(event) =>
                    setNewProduct(
                      (current) => ({
                        ...current,
                        purchasePrice:
                          event.target.value,
                      })
                    )
                  }
                />

              </label>


              {/* ADD PRODUCT */}

              <button
                type="button"
                className="good-receipt-add-product-confirm"
                onClick={addNewProduct}
              >
                Add Product to Receipt
              </button>

            </div>

          )}


          {/* SEARCH RESULTS */}

          {productSearch &&
            searchedProducts.length > 0 && (

              <div className="good-receipt-product-results">

                {searchedProducts.map(
                  (product) => (

                    <button
                      key={product.id}
                      type="button"
                      className="good-receipt-product-result"
                      onClick={() =>
                        addProduct(product)
                      }
                    >

                      <div>

                        <strong>
                          {product.name}
                        </strong>

                        <small>
                          {product.barcode}
                        </small>

                      </div>

                      <span>
                        {formatCurrency(
                          product.purchase_price
                        )}
                      </span>

                    </button>

                  )
                )}

              </div>

            )}


          {/* PRODUCT NOT FOUND */}

          {productSearch &&
            !productsLoading &&
            searchedProducts.length === 0 && (

              <p className="good-receipt-product-message">
                Product not found. Add it as a new
                product above.
              </p>

            )}


          {/* RECEIVE ERROR */}

          {receiveError && (
            <p
              className="good-receipt-product-error"
              role="alert"
            >
              {receiveError}
            </p>
          )}


          {/* =================================
              ITEMS TABLE
          ================================= */}

          <div className="good-receipt-items-table">

            <div className="good-receipt-item-head">

              <span>
                Product
              </span>

              <span>
                Qty
              </span>

              <span>
                Purchase Price
              </span>

              <span>
                Total
              </span>

              <span>
              </span>

            </div>


            {items.length === 0 ? (

              <div className="good-receipt-no-items">

                <Package size={24} />

                <span>
                  No products added yet
                </span>

                <small>
                  Search for a product above to
                  add it.
                </small>

              </div>

            ) : (

              items.map((item) => (

                <div
                  className="good-receipt-item-row"
                  key={item.product_id}
                >

                  {/* PRODUCT */}

                  <div>

                    <strong>
                      {item.name}
                    </strong>

                    <small>
                      {item.barcode}
                    </small>

                  </div>


                  {/* QUANTITY */}

                  <div>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(event) =>
                        changeQuantity(
                          item.product_id,
                          event.target.value
                        )
                      }
                    />

                  </div>


                  {/* PURCHASE PRICE */}

                  <div>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      aria-label={
                        `Purchase price for ${item.name}`
                      }
                      value={
                        item.purchase_price
                      }
                      onChange={(event) =>
                        changePurchasePrice(
                          item.product_id,
                          event.target.value
                        )
                      }
                    />

                  </div>


                  {/* TOTAL */}

                  <div>

                    <strong>
                      {formatCurrency(
                        Number(item.quantity) *
                          Number(
                            item.purchase_price
                          )
                      )}
                    </strong>

                  </div>


                  {/* REMOVE */}

                  <div>

                    <button
                      type="button"
                      className="good-receipt-remove-item"
                      onClick={() =>
                        removeItem(
                          item.product_id
                        )
                      }
                      title="Remove item"
                    >
                      <Trash2 size={15} />
                    </button>

                  </div>

                </div>

              ))

            )}

          </div>

        </div>


        {/* =================================
            NOTES
        ================================= */}

        <div className="good-receipt-notes">

          <label>
            Notes
          </label>

          <textarea
            placeholder="Add notes about this receipt..."
            rows="3"
            value={notes}
            onChange={(event) =>
              setNotes(event.target.value)
            }
          />

        </div>


        {/* =================================
            FOOTER
        ================================= */}

        <footer className="good-receipt-modal-footer">

          <div className="good-receipt-total-summary">

            <span>
              Total Items
            </span>

            <strong>
              {totalItems}
            </strong>

          </div>


          <div className="good-receipt-total-summary main">

            <span>
              Total Purchase Value
            </span>

            <strong>
              {formatCurrency(
                totalPurchaseValue
              )}
            </strong>

          </div>


          <div className="good-receipt-modal-actions">

            <button
              type="button"
              className="good-receipt-cancel"
              onClick={onClose}
            >
              Cancel
            </button>


            <button
              type="button"
              className="good-receipt-save"
              onClick={receiveGoods}
              disabled={
                isReceiving ||
                productsLoading
              }
            >

              <CheckCircle2 size={15} />

              {isReceiving
                ? "Receiving..."
                : "Receive Goods"}

            </button>

          </div>

        </footer>

      </div>
    </div>
  );
}

export default GoodReceiptModal;