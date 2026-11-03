import { getAdminAuthHeaders } from "./adminAuthService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function getAllOrders() {
  try {
    const response = await fetch(`${API_URL}/admin/orders`, {
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
