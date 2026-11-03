import { getAdminAuthHeaders } from "./adminAuthService";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function getAllUsers() {
  try {
    const response = await fetch(`${API_BASE}/user/all`, {
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
