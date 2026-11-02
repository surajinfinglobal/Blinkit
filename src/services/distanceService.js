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
    `http://localhost:5000/api/distance?${params.toString()}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Distance calculate nahi hui");
  }

  return data;
};
