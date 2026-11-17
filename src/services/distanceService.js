import { API_BASE_URL } from './apiConfig.js';

export const getDistanceAPI = async ({
  startLat,
  startLng,
  endLat,
  endLng,
}) => {
  const params = new URLSearchParams({
    startLat,
    startLng,
    endLat,
    endLng,
  });
   const response = await fetch(
    `${API_BASE_URL}/distance?${params.toString()}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Distance calculate nahi hui");
  }

  return data;
};
