import { ENDPOINTS } from "./endpoint";

async function requestGoodReceipts(
  path = "",
  options = {}
) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${ENDPOINTS.goodReceipts}${path}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      data?.message ||
      "Good Receipt request failed"
    );
  }

  return data;
}

export function getGoodReceipts() {
  return requestGoodReceipts();
}

export function getGoodReceipt(receiptId) {
  return requestGoodReceipts(
    String(receiptId)
  );
}

export function createGoodReceipt(receipt) {
  return requestGoodReceipts("", {
    method: "POST",
    body: JSON.stringify(receipt),
  });
}