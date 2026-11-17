import { API_BASE_URL } from './apiConfig.js';

export const addFavoriteAPI = async (productId) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/favorites/${productId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Favourite add nahi hua');
  }
  return res.json();
};

export const removeFavoriteAPI = async (productId) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/favorites/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
      if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Favourite remove nahi hua');
  }
  return res.json();
};

export const getFavoritesAPI = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/favorites`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Favourites load nahi hue');
  return res.json();
};

export const clearFavoritesAPI = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/favorites`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Favourites clear nahi hue');
  }
  return res.json();
};