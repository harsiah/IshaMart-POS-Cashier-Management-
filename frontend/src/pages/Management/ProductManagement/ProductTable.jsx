import React from "react";
import {
  Box as FiBox,
  MoreVertical as FiMoreVertical,
} from "lucide-react";

import {
  getStockClass,
} from "./productManagementUtils";
import {
  formatCurrency,
  formatDate,
} from "../../../utils/formatters";

function ProductTable({
  products,
  isLoading,
  openMenu,
  setOpenMenu,
  onEdit,
  onDeactivate,
}) {
  return (
    <div className="table-scroll">
      <table className="product-table">

        {/* ==================================
            TABLE HEADER
        ================================== */}

        <thead>
          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>Barcode</th>
            <th>Category</th>
            <th>Selling Price</th>
            <th>Purchase Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Updated</th>
            <th></th>
          </tr>
        </thead>

        {/* ==================================
            TABLE BODY
        ================================== */}

        <tbody>

          {products.map((product) => {

            const margin =
              Number(product.selling_price || 0) -
              Number(product.purchase_price || 0);

            const stockClass =
              getStockClass(product.stock);

            return (
              <tr key={product.id}>

                {/* ==================================
                    ID
                ================================== */}

                <td>
                  <span className="product-id">
                    #{String(product.id).padStart(3, "0")}
                  </span>
                </td>

                {/* ==================================
                    PRODUCT
                ================================== */}

                <td>

                  <div className="product-info">

                    <div className="product-image">

                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                        />
                      ) : (
                        <FiBox />
                      )}

                    </div>

                    <div className="product-name">

                      <strong>
                        {product.name}
                      </strong>

                      <small>
                        Created{" "}
                        {formatDate(
                          product.created_at
                        )}
                      </small>

                    </div>

                  </div>

                </td>

                {/* ==================================
                    BARCODE
                ================================== */}

                <td>

                  <span className="product-barcode">
                    {product.barcode}
                  </span>

                </td>

                {/* ==================================
                    CATEGORY
                ================================== */}

                <td>

                  <span className="product-category">
                    {product.category ||
                      "Uncategorized"}
                  </span>

                </td>

                {/* ==================================
                    SELLING PRICE
                ================================== */}

                <td>

                  <span className="product-price">
                    {formatCurrency(
                      product.selling_price
                    )}
                  </span>

                  <small className="product-margin">
                    +{formatCurrency(margin)}
                  </small>

                </td>

                {/* ==================================
                    PURCHASE PRICE
                ================================== */}

                <td>

                  <span className="product-purchase-price">
                    {formatCurrency(
                      product.purchase_price
                    )}
                  </span>

                </td>

                {/* ==================================
                    STOCK
                ================================== */}

                <td>

                  <span
                    className={`product-stock ${stockClass}`}
                  >

                    <span className="product-stock-dot" />

                    <strong>
                      {product.stock}
                    </strong>

                  </span>

                </td>

                {/* ==================================
                    STATUS
                ================================== */}

                <td>

                  <span
                    className={`product-status ${
                      product.is_active
                        ? "active"
                        : "inactive"
                    }`}
                  >
                    {product.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>

                </td>

                {/* ==================================
                    UPDATED
                ================================== */}

                <td>

                  <span className="product-date">
                    {formatDate(
                      product.updated_at
                    )}
                  </span>

                </td>

                {/* ==================================
                    ACTION
                ================================== */}

                <td className="product-actions">

                  <div className="product-action-menu">

                    <button
                      className="product-action-button"
                      type="button"
                      title="More actions"
                      onClick={() =>
                        setOpenMenu(
                          openMenu === product.id
                            ? null
                            : product.id
                        )
                      }
                    >
                      <FiMoreVertical size={15} />
                    </button>


                    {openMenu === product.id && (

                      <div className="product-dropdown-menu">

                        {/* EDIT */}

                        <button
                          type="button"
                          onClick={() => {
                            onEdit(product);
                            setOpenMenu(null);
                          }}
                        >
                          ✏️ Edit Product
                        </button>


                        {/* DELETE / DEACTIVATE */}

                        <button
                          type="button"
                          className="delete"
                          onClick={() =>
                            onDeactivate(product)
                          }
                        >
                          🗑️ Delete Product
                        </button>

                      </div>

                    )}

                  </div>

                </td>

              </tr>
            );
          })}


          {/* ==================================
              EMPTY
          ================================== */}

          {!isLoading &&
            products.length === 0 && (

              <tr>

                <td
                  className="product-empty"
                  colSpan="10"
                >
                  No products found.
                </td>

              </tr>

            )}


          {/* ==================================
              LOADING
          ================================== */}

          {isLoading && (

            <tr>

              <td
                className="product-empty"
                colSpan="10"
              >
                Loading products...
              </td>

            </tr>

          )}

        </tbody>

      </table>
    </div>
  );
}

export default ProductTable;