const express = require('express');
const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const { q, lat, lon, platform = 'BlinkIt', pincode } = req.query;

    if (!q || lat === undefined || lon === undefined) {
      return res.status(400).json({
        message: 'q, lat and lon are required',
      });
    }  const params = new URLSearchParams({
      q,
      lat,
      lon,
      platform,
    });

    if (pincode) {
      params.set('pincode', pincode);
    }

    const response = await fetch(
      `https://api.quickcommerceapi.com/v1/search?${params}`,
      {
        headers: {
          'X-API-Key': process.env.QUICKCOMMERCE_API_KEY,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: data.message || 'Product API request failed',
        details: data,
      });
    }

    return res.json(data);
  } catch (error) {
    console.error('Product search error:', error);

    return res.status(500).json({
      message: 'Unable to fetch products',
    });
  }
});

module.exports = router;