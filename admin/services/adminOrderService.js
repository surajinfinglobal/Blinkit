
import { getAdminAuthHeaders } from "./adminAuthService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(url, options = {}) {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAdminAuthHeaders(),
      ...options.headers,
    },
  });


  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export async function getAvailableRidersAPI() {
  const data = await request("/admin/riders");
  return data.riders;
}


export async function assignRiderAPI(orderId, riderId) {
  const data = await request(`/admin/orders/${orderId}/assign-rider`, {
    method: "PATCH",
    body: JSON.stringify({ riderId }),
  });

  return data.order;
}

export async function updateOrderStatusAPI(orderId, orderStatus) {
  const apiStatus = {
    pending: "received",
    packing: "packing",
    "in-transit": "out_for_delivery",
    delivered: "delivered",
    cancelled: "cancelled",
  }[orderStatus];

  if (!apiStatus) {
    throw new Error("Invalid order status");
  }

  const data = await request(`/admin/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ orderStatus: apiStatus }),
  });
  return data.order;
}