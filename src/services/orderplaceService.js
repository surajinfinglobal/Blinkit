
export const placeOrderAPI = async (payload) => {
const token = localStorage.getItem('token');
  const response = await fetch("http://localhost:5000/api/orders", {
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
