// ==========================================
// STOCK CLASS
// ==========================================

export function getStockClass(stock) {
  if (stock === 0) {
    return "out";
  }

  if (stock <= 10) {
    return "low";
  }

  return "";
}