const API_URL = 'http://localhost:5000/api';
export async function searchProducts(query, lat, lon) {
  const params = new URLSearchParams({
    q: query,
    lat: String(lat),
    lon: String(lon),
    platform: 'BlinkIt',
  });

  const response = await fetch(
    `${API_URL}/products/search?${params}`
  );
   const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Products fetch failed');
  }

  return data.data.products;
}