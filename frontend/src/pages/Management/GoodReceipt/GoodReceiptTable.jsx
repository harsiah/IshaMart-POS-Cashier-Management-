import React, { useRef } from "react";
import {
  CalendarDays,
  Search,
} from "lucide-react";
import DateInput from "../../../components/DateInput";
import {
  formatCurrency,
  formatDate,
} from "../../../utils/formatters";

function GoodReceiptTable({
  search,
  setSearch,
  receiptDateFilter,
  setReceiptDateFilter,
  filteredReceipts,
  receipts,
  receiptsError,
  onView,
}) {
  const dateInputRef = useRef(null);

  function openDatePicker() {
    const dateInput = dateInputRef.current;

    if (!dateInput) {
      return;
    }

    if (typeof dateInput.showPicker === "function") {
      dateInput.showPicker();
      return;
    }

    dateInput.focus();
    dateInput.click();
  }

  return (
    <section className="good-receipt-list">

      {/* =====================================
          ERROR
      ===================================== */}

      {receiptsError && (
        <p
          className="good-receipt-product-error"
          role="alert"
        >
          Could not load receipt history:{" "}
          {receiptsError}
        </p>
      )}


      {/* =====================================
          TOOLBAR
      ===================================== */}

      <div className="good-receipt-toolbar">

        <label className="good-receipt-search">

          <Search size={15} />

          <input
            type="search"
            placeholder="Search GR number or supplier..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </label>


        <div className="good-receipt-date-control">
          <button
            className="good-receipt-date-button"
            type="button"
            onClick={openDatePicker}
            aria-label={
              receiptDateFilter
                ? `Filter receipts by date: ${formatDate(receiptDateFilter)}`
                : "Filter receipts by date"
            }
          >
            <CalendarDays size={14} />

            <span>
              {receiptDateFilter
                ? formatDate(receiptDateFilter)
                : "Date"}
            </span>
          </button>

          <DateInput
            ariaLabel="Filter receipts by date"
            className="good-receipt-date-input"
            value={receiptDateFilter}
            onChange={setReceiptDateFilter}
            inputRef={dateInputRef}
          />
        </div>

      </div>


      {/* =====================================
          TABLE
      ===================================== */}

      <div className="table-scroll">

        <table className="good-receipt-table">

          <thead>

            <tr>
              <th>GR Number</th>
              <th>Date</th>
              <th>Supplier</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th></th>
            </tr>

          </thead>


          <tbody>

            {filteredReceipts.map(
              (receipt) => (

                <tr key={receipt.id}>

                  {/* GR NUMBER */}

                  <td>
                    <strong className="good-receipt-number">
                      {receipt.number}
                    </strong>
                  </td>


                  {/* DATE */}

                  <td>
                    <span className="good-receipt-date">
                      {formatDate(
                        receipt.date
                      )}
                    </span>
                  </td>


                  {/* SUPPLIER */}

                  <td>
                    <span className="good-receipt-supplier">
                      {receipt.supplier}
                    </span>
                  </td>


                  {/* ITEMS */}

                  <td>
                    <span className="good-receipt-items">
                      {receipt.items} items
                    </span>
                  </td>


                  {/* TOTAL */}

                  <td>
                    <strong className="good-receipt-total">
                      {formatCurrency(
                        receipt.total
                      )}
                    </strong>
                  </td>


                  {/* STATUS */}

                  <td>

                    <span className="good-receipt-status">

                      <span />

                      {receipt.status}

                    </span>

                  </td>


                  {/* VIEW */}

                  <td>

                    <button
                      className="good-receipt-view-button"
                      type="button"
                      onClick={() => onView(receipt)}
                    >
                      View
                    </button>

                  </td>

                </tr>

              )
            )}


            {/* EMPTY STATE */}

            {filteredReceipts.length === 0 && (

              <tr>

                <td
                  colSpan="7"
                  className="good-receipt-empty"
                >
                  No good receipt found.
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>


      {/* =====================================
          FOOTER
      ===================================== */}

      <footer className="good-receipt-footer">

        Showing{" "}

        <strong>
          {filteredReceipts.length}
        </strong>{" "}

        of{" "}

        <strong>
          {receipts.length}
        </strong>{" "}

        receipts

      </footer>

    </section>
  );
}

export default GoodReceiptTable;