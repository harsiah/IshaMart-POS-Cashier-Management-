// ==========================================
// CURRENCY FORMATTING
// ==========================================

export function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}


// ==========================================
// FORMAT DATE
// ==========================================

export function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}