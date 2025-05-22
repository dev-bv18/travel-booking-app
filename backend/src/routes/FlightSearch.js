router.get('/flights', async (req, res) => {
  try {
    const { origin, destination, departDate, returnDate, passengers, cabinClass, tripType } = req.query;

    // Validate required parameters
    if (!origin || !destination || !departDate || !passengers || !cabinClass) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const token = await getAmadeusToken();
    const params = {
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate: departDate,
      adults: passengers,
      travelClass: cabinClass,
      max: 10
    };

    if (tripType === 'roundtrip' && returnDate) {
      params.returnDate = returnDate;
    }

    const response = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
      headers: { Authorization: `Bearer ${token}` },
      params
    });

    // Transform Amadeus response to frontend-friendly format
    const flights = response.data.data.map(offer => {
      const itinerary = offer.itineraries[0];
      const segment = itinerary.segments[0];
      const lastSegment = itinerary.segments[itinerary.segments.length - 1];

      return {
        origin: segment.departure.iataCode,
        destination: lastSegment.arrival.iataCode,
        departureTime: segment.departure.at,
        arrivalTime: lastSegment.arrival.at,
        duration: itinerary.duration,
        airline: segment.carrierCode,
        flightNumber: segment.number,
        price: offer.price.total
      };
    });

    res.json(flights);
  } catch (error) {
    console.error('Flight search error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to search flights',
      details: error.response?.data?.errors || error.message
    });
  }
});

// Mount the router
app.use('/api/amadeus', router);