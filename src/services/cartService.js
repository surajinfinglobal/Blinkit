import { httpRequest } from './http';

const API_URL = 'http://localhost:5000/api';

async function cartRequest(path, options = {}) {
  return httpRequest(`/cart${path}`, options);
}

// get carts
export async function getCart() {
  return cartRequest('');
}

export async function updateCartQuantity(productId, qty) {
  return cartRequest(`/${encodeURIComponent(productId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ qty }),
  });
}

export async function removeFromCart(productId) {
  return cartRequest(`/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
  });
}

// add to cart
export async function addToCart(product) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/cart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      productId: String(product.id),
      name: product.name,
      image: product.image,
      unit: product.unit,
      price: Number(product.price),
    }),
  });

  if (response.status === 401) {
    try {
      localStorage.removeItem('token');
    } catch (e) {}
    if (typeof window !== 'undefined') {
      const current = window.location.pathname;
      if (current !== '/login' && current !== '/phone' && current !== '/' && current !== '/Welcome') {
        window.location.href = '/phone';
      }
    }
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Session expired. Please login again.');
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to add product');
  }
  return data;
}
