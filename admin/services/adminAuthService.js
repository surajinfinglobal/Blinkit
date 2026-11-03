const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const ADMIN_TOKEN_KEY = "adminToken";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Admin request failed");
  }

  return data;
}

export async function adminLogin(credentials) {
  const data = await request("/admin/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  if (!data.token || !data.admin) {
    throw new Error("Admin login response is invalid");
  }

  localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
  return data;
}

export async function getCurrentAdmin() {
  const data = await request("/admin/auth/me", {
    headers: getAdminAuthHeaders(),
  });
  return data.admin;
}

export function getAdminAuthHeaders() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}
