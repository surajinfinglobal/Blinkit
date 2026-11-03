
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const placeOrderAPI = async (payload) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Order place nahi ho saka");
  }

  return data;
};


export const getMyOrdersAPI = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Please log in to view your orders.");
  }

  const response = await fetch(`${API_URL}/orders/my-orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Orders fetch failed");
  }
  if (!data.success || !Array.isArray(data.orders)) {
    throw new Error("Orders response is invalid");
  }

  return data.orders;
};