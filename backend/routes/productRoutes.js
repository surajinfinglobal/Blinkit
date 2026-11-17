const express = require('express');
const { createHash } = require('node:crypto');
const router = express.Router();
const redisClient = require('../config/redis.js');

const CACHE_TTL_SECONDS = 2 * 24 * 60 * 60;
const CATALOG_COORDINATES = { lat: 12.9716, lon: 77.5946 };

router.get('/search', async (req, res) => {
  try {
    const { q, platform = 'BlinkIt' } = req.query;
    const query = typeof q === 'string' ? q.trim() : '';

    if (!query) {
      return res.status(400).json({
        message: 'A search query is required',
      });
    }

    const params = new URLSearchParams({
      q: query,
      lat: String(CATALOG_COORDINATES.lat),
      lon: String(CATALOG_COORDINATES.lon),
      platform: String(platform),
    });

    const cacheKey = `products:search:${createHash('sha256')
      .update(params.toString())
      .digest('hex')}`;

    if (redisClient.isReady) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return res.json(JSON.parse(cached));
        }
      } catch (error) {
        console.error('Product cache read error:', error);
      }
    }

    if (!process.env.QUICKCOMMERCE_API_KEY) {
      return res.status(500).json({
        message: 'Product search is not configured',
      });
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

    if (redisClient.isReady) {
      try {
        await redisClient.set(cacheKey, JSON.stringify(data), {
          EX: CACHE_TTL_SECONDS,
        });
      } catch (error) {
        console.error('Product cache write error:', error);
      }
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