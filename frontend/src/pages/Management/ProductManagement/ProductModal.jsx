import React from "react";
import { Box as FiBox, X as FiX } from "lucide-react";

function ProductModal({
  editingProduct,
  categories,
  productName,
  setProductName,
  barcode,
  setBarcode,
  productCategory,
  setProductCategory,
  stock,
  setStock,
  purchasePrice,
  setPurchasePrice,
  sellingPrice,
  setSellingPrice,
  productImagePreview,
  handleImageChange,
  onClose,
  onSave,
  isSaving,
}) {
  return (
    <div
      className="product-modal-backdrop"
      onMouseDown={onClose}
    >
      <div
        className="product-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* ==================================
            MODAL HEADER
        ================================== */}

        <div className="product-modal-header">
          <div>
            <h2>
              {editingProduct
                ? "Edit Product"
                : "Add New Product"}
            </h2>

            <p>
              Add a new product to the IshaMart catalog.
            </p>
          </div>

          <button
            className="product-modal-close"
            type="button"
            onClick={onClose}
          >
            <FiX size={17} />
          </button>
        </div>

        {/* ==================================
            FORM
        ================================== */}

        <div className="product-form-grid">

          {/* ==================================
              IMAGE
          ================================== */}

          <div className="product-form-field full">
            <label>
              Product Image
            </label>

            <div className="product-image-upload">

              <div className="product-image-preview">
                {productImagePreview ? (
                  <img
                    src={productImagePreview}
                    alt="Product preview"
                  />
                ) : (
                  <FiBox />
                )}
              </div>

              <label className="product-upload-button">
                Upload Image

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </label>

            </div>
          </div>

          {/* ==================================
              PRODUCT NAME
          ================================== */}

          <div className="product-form-field">
            <label>
              Product Name
            </label>

            <input
              type="text"
              placeholder="Enter product name"
              value={productName}
              onChange={(event) =>
                setProductName(event.target.value)
              }
            />
          </div>

          {/* ==================================
              BARCODE
          ================================== */}

          <div className="product-form-field">
            <label>
              Barcode
            </label>

            <input
              type="text"
              placeholder="Enter barcode"
              value={barcode}
              onChange={(event) =>
                setBarcode(event.target.value)
              }
            />
          </div>

          {/* ==================================
              CATEGORY
          ================================== */}

          <div className="product-form-field">
            <label>
              Category
            </label>

            <select
              value={productCategory}
              onChange={(event) =>
                setProductCategory(event.target.value)
              }
            >
              <option value="">
                Select category
              </option>

              {categories.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* ==================================
              STOCK
          ================================== */}

          <div className="product-form-field">
            <label>
              Stock
            </label>

            <input
              type="number"
              min="0"
              placeholder="0"
              value={stock}
              onChange={(event) =>
                setStock(event.target.value)
              }
            />
          </div>

          {/* ==================================
              PURCHASE PRICE
          ================================== */}

          <div className="product-form-field">
            <label>
              Purchase Price
            </label>

            <input
              type="number"
              min="0"
              placeholder="0"
              value={purchasePrice}
              onChange={(event) =>
                setPurchasePrice(event.target.value)
              }
            />
          </div>

          {/* ==================================
              SELLING PRICE
          ================================== */}

          <div className="product-form-field">
            <label>
              Selling Price
            </label>

            <input
              type="number"
              min="0"
              placeholder="0"
              value={sellingPrice}
              onChange={(event) =>
                setSellingPrice(event.target.value)
              }
            />
          </div>

        </div>

        {/* ==================================
            MODAL ACTIONS
        ================================== */}

        <div className="product-modal-actions">

          <button
            className="product-cancel-button"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="product-save-button"
            type="button"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving
              ? "Saving..."
              : editingProduct
                ? "Save Changes"
                : "Add Product"}
          </button>

        </div>

      </div>
    </div>
  );
}

export default ProductModal;