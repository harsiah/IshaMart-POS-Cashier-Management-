import { ENDPOINTS } from "./endpoint";

async function requestProducts(path = "", options = {}) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${ENDPOINTS.products}${path}`,
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
      "Product request failed"
    );
  }

  return data;
}

export function getProducts() {
  return requestProducts();
}

export function createProduct(product) {
  return requestProducts("", {
    method: "POST",
    body: JSON.stringify(product),
  });
}

export function updateProduct(productId, product) {
  return requestProducts(String(productId), {
    method: "PUT",
    body: JSON.stringify(product),
  });
}

export function deactivateProduct(productId) {
  return requestProducts(
    `${productId}/deactivate`,
    {
      method: "PUT",
    }
  );
}