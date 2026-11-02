const express = require("express");
const router = express.Router();

router.get("/distance", async (req, res) => {
     try {
    const { startLat, startLng, endLat, endLng } = req.query;
    const coords = [startLat, startLng, endLat, endLng].map(Number);
        if (
      coords.some((n) => !Number.isFinite(n)) ||
      Number(startLat) < -90 || Number(startLat) > 90 ||
      Number(endLat) < -90 || Number(endLat) > 90 ||
      Number(startLng) < -180 || Number(startLng) > 180 ||
      Number(endLng) < -180 || Number(endLng) > 180
    ) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }
    const waypoints =
      `${startLat},${startLng}|${endLat},${endLng}`;

    const url = new URL("https://api.geoapify.com/v1/routing");
    url.searchParams.set("waypoints", waypoints);
    url.searchParams.set("mode", "drive");
    url.searchParams.set("format", "json");
    url.searchParams.set("apiKey", process.env.GEOAPIFY_API_KEY);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: data.message || "Routing API failed",
      });
    }

    const route = data.results?.[0];

    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    res.json({
      distanceKm: Number((route.distance / 1000).toFixed(2)),
      durationMinutes: Math.round(route.time / 60),
    });
  } catch (error) {
    console.error("Distance API error:", error);
    res.status(500).json({ message: "Distance calculate nahi hui" });
  }
    });

module.exports = router;