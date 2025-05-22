const express = require('express');
const router = express.Router();
const Amadeus = require('amadeus');
require('dotenv').config();

// Initialize Amadeus API client
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET
});

// Middleware to handle errors
const handleErrors = (res, error) => {
  console.error('Amadeus API error:', error);
  const status = error.response?.statusCode || 500;
  const message = error.response?.body?.errors?.[0]?.detail || 'Failed to fetch hotel data';
  res.status(status).json({ error: message });
};

// Search hotels by city code
router.get('/search', async (req, res) => {
  try {
    const { cityCode, checkInDate, checkOutDate, adults, radius, ratings } = req.query;
    
    if (!cityCode || !checkInDate || !checkOutDate) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // First, get hotel list
    const hotelResponse = await amadeus.referenceData.locations.hotels.byCity.get({
      cityCode,
      radius: radius || 20,
      ratings: ratings || '1,2,3,4,5',
      includeClosed: false
    });

    const hotelIds = hotelResponse.data.map(hotel => hotel.hotelId).join(',');

    if (!hotelIds) {
      return res.status(404).json({ error: 'No hotels found in this area' });
    }

    // Then get offers for these hotels
    const offersResponse = await amadeus.shopping.hotelOffers.get({
      hotelIds,
      checkInDate,
      checkOutDate,
      adults: adults || 1,
      bestRateOnly: true,
      currency: 'USD'
    });

    res.json({
      hotels: hotelResponse.data,
      offers: offersResponse.data
    });
  } catch (error) {
    handleErrors(res, error);
  }
});

// Get hotel details by ID
router.get('/hotel/:hotelId', async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { checkInDate, checkOutDate, adults } = req.query;

    if (!hotelId) {
      return res.status(400).json({ error: 'Hotel ID is required' });
    }

    const response = await amadeus.shopping.hotelOffers.get({
      hotelIds: hotelId,
      checkInDate,
      checkOutDate,
      adults: adults || 1
    });

    if (!response.data || response.data.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    res.json(response.data[0]);
  } catch (error) {
    handleErrors(res, error);
  }
});

// Book a hotel room
router.post('/book', async (req, res) => {
  try {
    const { offerId, guests, payments } = req.body;

    if (!offerId || !guests || !payments) {
      return res.status(400).json({ error: 'Missing required booking information' });
    }

    // In a real implementation, you would call Amadeus booking API here
    // This is a mock response since actual booking requires more complex setup
    const bookingResponse = {
      data: {
        type: 'hotel-booking',
        id: `BKG-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        offerId,
        guests,
        payments,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      }
    };

    res.json(bookingResponse);
  } catch (error) {
    handleErrors(res, error);
  }
});

module.exports = router;