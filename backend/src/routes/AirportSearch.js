// In your server.js or routes file
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Middleware to handle Amadeus authentication
let amadeusToken = null;

async function getAmadeusToken() {
  if (amadeusToken && amadeusToken.expiresAt > Date.now()) {
    return amadeusToken.access_token;
  }

  const response = await axios.post('https://test.api.amadeus.com/v1/security/oauth2/token', 
    `grant_type=client_credentials&client_id=${process.env.AMADEUS_API_KEY}&client_secret=${process.env.AMADEUS_API_SECRET}`,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  amadeusToken = {
    access_token: response.data.access_token,
    expiresAt: Date.now() + (response.data.expires_in * 1000) - 60000 // 1 min buffer
  };

  return amadeusToken.access_token;
}

// Airport search endpoint
router.get('/airports', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    const token = await getAmadeusToken();
    const response = await axios.get('https://test.api.amadeus.com/v1/reference-data/locations', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        subType: 'CITY,AIRPORT',
        keyword: query,
        page: { limit: 10 }
      }
    });

    const airports = response.data.data.map(location => ({
      code: location.iataCode,
      name: location.name,
      city: location.address?.cityName || '',
      country: location.address?.countryName || ''
    }));

    res.json(airports);
  } catch (error) {
    console.error('Airport search error:', error);
    res.status(500).json({ error: 'Failed to fetch airport data' });
  }
});