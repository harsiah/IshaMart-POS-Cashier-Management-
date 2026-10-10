// ==========================================
// FORMAT INPUT DATE
// ==========================================

export function formatInputDate(date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


// ==========================================
// GENERATE GR NUMBER
// ==========================================

export function generateGRNumber(receipts, date) {
  const receiptSequence = receipts.reduce(
    (highest, receipt) => {
      const match = receipt.number.match(
        /^GR-\d{8}-(\d+)$/
      );

      return match
        ? Math.max(highest, Number(match[1]))
        : highest;
    },
    0
  );

  const storedSequence = Number(
    localStorage.getItem(
      "goodReceiptLastSequence"
    )
  );

  const lastSequence = Math.max(
    receiptSequence,
    Number.isSafeInteger(storedSequence)
      ? storedSequence
      : 0
  );

  const datePart = date.replaceAll("-", "");

  const nextSequence = String(
    lastSequence + 1
  ).padStart(3, "0");

  return `GR-${datePart}-${nextSequence}`;
}


// ==========================================
// MAP SAVED RECEIPT
// ==========================================

export function mapSavedReceipt(receipt) {
  const items = receipt.items || [];

  return {
    id: receipt.id,
    number: receipt.gr_number,
    date: receipt.receipt_date,
    supplier: receipt.supplier,

    items: items.reduce(
      (total, item) =>
        total + Number(item.quantity),
      0
    ),

    total: items.reduce(
      (total, item) =>
        total + Number(item.total),
      0
    ),

    status: receipt.status,
  };
}