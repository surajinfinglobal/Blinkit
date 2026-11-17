import { getAdminAuthHeaders } from "./adminAuthService";
import { API_BASE_URL } from "../../src/services/apiConfig.js";

export async function getAllUsers() {
  try {
    const response = await fetch(`${API_BASE_URL}/user/all`, {
      headers: getAdminAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch users');
    }
    return data.users || [];
  } catch (error) {
    console.error('Get all users error:', error);
    throw error;
  }
}
