import { ENDPOINTS } from "./endpoint";

export async function login(username, password) {
  const response = await fetch(ENDPOINTS.login, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || data.message || "Login gagal");
  }

  if (!data.access_token) {
    throw new Error(data.message || "Username atau password salah");
  }

  return data;
}
