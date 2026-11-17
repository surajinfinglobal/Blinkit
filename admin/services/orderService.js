import { getAdminAuthHeaders } from "./adminAuthService";
import { API_BASE_URL } from "../../src/services/apiConfig.js";

export async function getAllOrders() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/orders`, {
      headers: getAdminAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch orders');
    }
    return data.orders || [];
  } catch (error) {
    console.error('Get all orders error:', error);
    throw error;
  }
}
