import { ENDPOINTS } from "./endpoint";

export async function checkApiHealth() {
  const response = await fetch(ENDPOINTS.health);

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
}