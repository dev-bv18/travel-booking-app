const axios = require('axios');
const router = require('express').Router();

// Flight Search (FlightAPI.io)
router.get('/flights', async (req, res) => {
  const { origin, destination, date } = req.query;
  try {
    const response = await axios.get('https://api.flightapi.io/flight/search', {
      params: {
        from: origin,
        to: destination,
        date,
        apiKey: process.env.FLIGHTAPI_KEY
      }
    });
    res.json(response.data.flights.map(flight => ({
      id: flight.id,
      airline: flight.airline.name,
      departure: flight.departureTime,
      price: flight.price.amount,
      bookingLink: flight.bookingUrl
    })));
  } catch (err) {
    res.status(500).json({ error: "Flight search failed" });
  }
});

// Train Search (eRail API)
router.get('/trains', async (req, res) => {
    const { origin, destination } = req.query;
    try {
      const response = await axios.get(
        `https://indianrailapi.com/api/v2/TrainBetweenStation/apikey/${process.env.ERAIL_KEY}/From/${origin}/To/${destination}`
      );
      res.json(response.data.Trains.map(train => ({
        id: train.TrainNo,
        name: train.TrainName,
        departure: train.DepartureTime,
        price: train.Fare,
        bookingLink: `https://erail.in/book?train=${train.TrainNo}`
      })));
    } catch (err) {
      res.status(500).json({ error: "Train search failed" });
    }
  });

  // Mock Bus Data
router.get('/buses', (req, res) => {
    res.json([{
      id: "bus1",
      name: "Express Bus",
      departure: "08:00",
      price: 25,
      bookingLink: "#"
    }]);
  });