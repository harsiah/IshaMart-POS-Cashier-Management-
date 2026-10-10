import React, { useState } from "react";
import { Printer, X } from "lucide-react";
import {
  formatCurrency,
  formatDate,
} from "../../../utils/formatters";
import { printDocument } from "../../../utils/print";

function GoodReceiptViewModal({
  receipt,
  isLoading,
  error,
  onClose,
}) {
  const items = receipt.itemDetails || [];
  const [printError, setPrintError] = useState("");

  function handlePrint() {
    setPrintError("");

    try {
      printDocument({
        title: "Good Receipt",
        subtitle: receipt.number,
        details: [
          { label: "Date", value: formatDate(receipt.date) },
          { label: "Supplier", value: receipt.supplier || "-" },
          {
            label: "Invoice Number",
            value: receipt.invoiceNumber || "-",
          },
          { label: "Status", value: receipt.status || "-" },
        ],
        columns: ["Product", "Quantity", "Purchase Price", "Total"],
        rows: items.map((item) => [
          item.name || `Product #${item.product_id}`,
          item.quantity,
          formatCurrency(item.purchase_price),
          formatCurrency(item.total),
        ]),
        notes: receipt.notes || "",
        footer: `${receipt.items || 0} items    ${formatCurrency(
          receipt.total
        )}`,
        signatures: ["Received By", "Approved By"],
      });
    } catch (error) {
      setPrintError(error.message || "Could not open the print dialog.");
    }
  }

  return (
    <div
      className="good-receipt-modal-backdrop"
      onMouseDown={onClose}
    >
      <section
        className="good-receipt-modal good-receipt-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="good-receipt-detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="good-receipt-modal-header">
          <div>
            <p>INVENTORY RECEIVING</p>
            <h2 id="good-receipt-detail-title">Good Receipt Details</h2>
            <span>{receipt.number}</span>
          </div>

          <div className="good-receipt-detail-actions">
            <button
              className="good-receipt-print-button"
              type="button"
              onClick={handlePrint}
              disabled={isLoading || Boolean(error)}
            >
              <Printer size={15} />
              Print
            </button>
            <button
              className="good-receipt-close"
              type="button"
              onClick={onClose}
              aria-label="Close receipt details"
            >
              <X size={17} />
            </button>
          </div>
        </header>

        {printError && (
          <p className="good-receipt-product-error" role="alert">
            {printError}
          </p>
        )}

        {error && (
          <p className="good-receipt-product-error" role="alert">
            Could not load receipt details: {error}
          </p>
        )}

        <div className="good-receipt-detail-summary">
          <div>
            <span>Date</span>
            <strong>{formatDate(receipt.date)}</strong>
          </div>
          <div>
            <span>Supplier</span>
            <strong>{receipt.supplier || "-"}</strong>
          </div>
          <div>
            <span>Invoice Number</span>
            <strong>{receipt.invoiceNumber || "-"}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{receipt.status || "-"}</strong>
          </div>
        </div>

        {isLoading ? (
          <p className="good-receipt-detail-message">
            Loading receipt details...
          </p>
        ) : (
          <>
            <div className="good-receipt-detail-items">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Purchase Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={`${item.product_id}-${index}`}>
                      <td>{item.name || `Product #${item.product_id}`}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.purchase_price)}</td>
                      <td>{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan="4">
                        {error
                          ? "Receipt item details are unavailable."
                          : "No items in this receipt."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {receipt.notes && (
              <div className="good-receipt-detail-notes">
                <span>Notes</span>
                <p>{receipt.notes}</p>
              </div>
            )}

            <footer className="good-receipt-detail-footer">
              <span>
                {receipt.items || 0} items
              </span>
              <strong>{formatCurrency(receipt.total)}</strong>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}

export default GoodReceiptViewModal;
