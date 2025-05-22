import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Box,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';

const HotelBooking = () => {
  const [searchParams, setSearchParams] = useState({
    cityCode: '',
    checkInDate: new Date(),
    checkOutDate: new Date(Date.now() + 86400000), // Tomorrow
    adults: 1,
    radius: 20,
    ratings: [3, 4, 5]
  });
  const [hotels, setHotels] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name, date) => {
    setSearchParams(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const searchHotels = async () => {
    if (!searchParams.cityCode) {
      setError('Please enter a city code (e.g., NYC for New York)');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const params = {
        cityCode: searchParams.cityCode,
        checkInDate: formatDate(searchParams.checkInDate),
        checkOutDate: formatDate(searchParams.checkOutDate),
        adults: searchParams.adults,
        radius: searchParams.radius,
        ratings: searchParams.ratings.join(',')
      };

      const response = await axios.get('/api/hotels/search', { params });
      setHotels(response.data.hotels);
      setOffers(response.data.offers);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to search hotels');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getHotelOffer = (hotelId) => {
    return offers.find(offer => offer.hotel.hotelId === hotelId);
  };

  const viewHotelDetails = async (hotelId) => {
    setLoading(true);
    try {
      const params = {
        checkInDate: formatDate(searchParams.checkInDate),
        checkOutDate: formatDate(searchParams.checkOutDate),
        adults: searchParams.adults
      };
      
      const response = await axios.get(`/api/hotels/hotel/${hotelId}`, { params });
      setSelectedHotel(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load hotel details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const bookHotel = async (offerId) => {
    if (!bookingForm.firstName || !bookingForm.lastName || !bookingForm.email) {
      setError('Please fill all required guest information');
      return;
    }

    setLoading(true);
    try {
      const guests = [{
        name: {
          firstName: bookingForm.firstName,
          lastName: bookingForm.lastName
        },
        contact: {
          email: bookingForm.email,
          phone: bookingForm.phone
        }
      }];

      const payments = [{
        method: 'creditCard',
        card: {
          number: bookingForm.cardNumber,
          expiryDate: bookingForm.expiryDate,
          cvv: bookingForm.cvv
        }
      }];

      const response = await axios.post('/api/hotels/book', {
        offerId,
        guests,
        payments
      });

      setBookingDetails(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete booking');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>Hotel Booking</Typography>
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="City Code (e.g., NYC)"
                name="cityCode"
                value={searchParams.cityCode}
                onChange={handleSearchChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <DatePicker
                label="Check-in"
                value={searchParams.checkInDate}
                onChange={(date) => handleDateChange('checkInDate', date)}
                minDate={new Date()}
                renderInput={(params) => <TextField fullWidth {...params} />}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <DatePicker
                label="Check-out"
                value={searchParams.checkOutDate}
                onChange={(date) => handleDateChange('checkOutDate', date)}
                minDate={searchParams.checkInDate}
                renderInput={(params) => <TextField fullWidth {...params} />}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Adults"
                name="adults"
                type="number"
                value={searchParams.adults}
                onChange={handleSearchChange}
                inputProps={{ min: 1, max: 10 }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={searchHotels}
                disabled={loading}
                sx={{ height: '56px' }}
              >
                {loading ? <CircularProgress size={24} /> : 'Search Hotels'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {error && (
          <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
            <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          </Snackbar>
        )}

        {bookingDetails ? (
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>Booking Confirmed!</Typography>
            <Typography variant="body1" gutterBottom>
              Your booking reference is: <strong>{bookingDetails.id}</strong>
            </Typography>
            <Typography variant="body1" gutterBottom>
              Status: <strong>{bookingDetails.status}</strong>
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setBookingDetails(null);
                setSelectedHotel(null);
              }}
              sx={{ mt: 2 }}
            >
              Make Another Booking
            </Button>
          </Paper>
        ) : selectedHotel ? (
          <HotelDetails
            hotel={selectedHotel}
            onBack={() => setSelectedHotel(null)}
            bookingForm={bookingForm}
            onBookingChange={handleBookingChange}
            onBook={bookHotel}
            loading={loading}
          />
        ) : (
          <Grid container spacing={3}>
            {loading && (
              <Grid item xs={12} sx={{ textAlign: 'center' }}>
                <CircularProgress />
              </Grid>
            )}
            
            {hotels.length > 0 && !loading && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {hotels.length} Hotels Found
                </Typography>
              </Grid>
            )}
            
            {hotels.map((hotel) => {
              const offer = getHotelOffer(hotel.hotelId);
              return (
                <Grid item xs={12} key={hotel.hotelId}>
                  <HotelCard
                    hotel={hotel}
                    offer={offer}
                    onClick={() => viewHotelDetails(hotel.hotelId)}
                  />
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </LocalizationProvider>
  );
};

const HotelCard = ({ hotel, offer, onClick }) => {
  return (
    <Card sx={{ display: 'flex', cursor: 'pointer' }} onClick={onClick}>
      <CardMedia
        component="img"
        sx={{ width: 200, display: { xs: 'none', sm: 'block' } }}
        image={hotel.media?.uri || 'https://via.placeholder.com/200x150?text=No+Image'}
        alt={hotel.name}
      />
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6">{hotel.name}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating value={parseInt(hotel.rating || 3)} readOnly precision={0.5} />
          <Typography variant="body2" sx={{ ml: 1 }}>
            {hotel.rating || 'N/A'}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {hotel.address?.lines?.join(', ')} • {hotel.contact?.phone}
        </Typography>
        
        {offer && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">
              <strong>${offer.offers[0].price.total}</strong> for {offer.offers[0].room.typeEstimated.category} room
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {offer.offers[0].room.typeEstimated.beds} beds • {offer.offers[0].room.typeEstimated.bedType}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const HotelDetails = ({ hotel, onBack, bookingForm, onBookingChange, onBook, loading }) => {
  const [selectedOffer, setSelectedOffer] = useState(null);

  useEffect(() => {
    if (hotel.offers && hotel.offers.length > 0) {
      setSelectedOffer(hotel.offers[0]);
    }
  }, [hotel]);

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Button variant="outlined" onClick={onBack} sx={{ mb: 2 }}>
        Back to Results
      </Button>
      
      <Typography variant="h5" gutterBottom>{hotel.hotel.name}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Rating value={parseInt(hotel.hotel.rating || 3)} readOnly precision={0.5} />
        <Typography variant="body2" sx={{ ml: 1 }}>
          {hotel.hotel.rating || 'N/A'}
        </Typography>
      </Box>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <CardMedia
            component="img"
            height="300"
            image={hotel.hotel.media?.uri || 'https://via.placeholder.com/600x300?text=No+Image'}
            alt={hotel.hotel.name}
            sx={{ borderRadius: 1 }}
          />
          
          <Typography variant="h6" sx={{ mt: 3 }}>Description</Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            {hotel.hotel.description?.text || 'No description available.'}
          </Typography>
          
          <Typography variant="h6" sx={{ mt: 3 }}>Amenities</Typography>
          <Grid container spacing={1} sx={{ mt: 1 }}>
            {hotel.hotel.amenities?.map((amenity, index) => (
              <Grid item xs={6} sm={4} key={index}>
                <Typography variant="body2">• {amenity}</Typography>
              </Grid>
            )) || (
              <Typography variant="body2">No amenities listed.</Typography>
            )}
          </Grid>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Available Rooms</Typography>
            
            {hotel.offers?.map((offer) => (
              <Paper
                key={offer.id}
                sx={{
                  p: 2,
                  mb: 2,
                  border: selectedOffer?.id === offer.id ? '2px solid #1976d2' : '1px solid #ddd',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedOffer(offer)}
              >
                <Typography variant="subtitle1">{offer.room.typeEstimated.category}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {offer.room.typeEstimated.beds} {offer.room.typeEstimated.bedType} beds
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  ${offer.price.total} total
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {offer.price.currency} • {offer.price.variations?.average?.base || offer.price.base} base
                </Typography>
              </Paper>
            ))}
            
            {selectedOffer && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>Guest Information</Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={bookingForm.firstName}
                      onChange={onBookingChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={bookingForm.lastName}
                      onChange={onBookingChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={bookingForm.email}
                      onChange={onBookingChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={bookingForm.phone}
                      onChange={onBookingChange}
                    />
                  </Grid>
                </Grid>
                
                <Typography variant="h6" sx={{ mt: 3 }} gutterBottom>Payment Details</Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Card Number"
                      name="cardNumber"
                      value={bookingForm.cardNumber}
                      onChange={onBookingChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Expiry Date (MM/YY)"
                      name="expiryDate"
                      value={bookingForm.expiryDate}
                      onChange={onBookingChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="CVV"
                      name="cvv"
                      value={bookingForm.cvv}
                      onChange={onBookingChange}
                      required
                    />
                  </Grid>
                </Grid>
                
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ mt: 3 }}
                  onClick={() => onBook(selectedOffer.id)}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Confirm Booking'}
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default HotelBooking;