import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { UPDATE_BOOKING_STATUS } from '../graphql/mutation';
import axios from 'axios';
import styled from 'styled-components';
import NavBar from './NavBar';
import Footer from './Footer';
import bgad from '../assests/london.jpg';

const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;

const BookingDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state; // Access the booking data passed through state

  const [images, setImages] = useState([]);
  const [updateBookingStatus] = useMutation(UPDATE_BOOKING_STATUS);
  useEffect(() => {
    window.scrollTo(0, 0); // Scrolls to the top when the component is mounted
  }, []);
  useEffect(() => {
    if (!booking) {
      console.warn('Booking not found. Redirecting to Booking History...');
      navigate('/booking-history');
    } else {
      fetchUnsplashImages(booking.package?.destination+' tourism' || 'travel');
    }
  }, [booking, navigate]);

  const fetchUnsplashImages = async (query) => {
    try {
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: { query, per_page: 8 },
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      });
      setImages(response.data.results.map((img) => img.urls.regular));
    } catch (error) {
      console.error('Error fetching images from Unsplash:', error);
    }
  };

  const handlePayment = async () => {
    if (booking.status === 'Confirmed') {
      alert('This booking is already paid.');
      return;
    }

    try {
      const { data } = await updateBookingStatus({
        variables: {
          bookingId: booking.id,
          status: 'Confirmed',
        },
      });

      if (data.updateBookingStatus.status === 'Confirmed') {
        alert('Payment successful! Your booking is now confirmed.');
        navigate('/booking-history');
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('Failed to update booking status. Please try again.');
    }
  };

  if (!booking) {
    return null;
  }

  return (
    <div>
      <NavBar />
      <Container>
        <h3>say hello to {booking.package?.destination}! &#9992; </h3>
        <h1>Booking Details</h1>
        <DetailsCard
  backgroundImage={images[7] || 'default-background.jpg'} // Use the first image or a default fallback
  status={booking.status}
>
  <h2>{booking.package?.title || 'Package Unavailable'}</h2>
  <p>
    <strong>Destination:</strong> {booking.package?.destination || 'N/A'}
  </p>
  <p>{booking.package?.description}</p>
  <p>
    <strong>Booking Date:</strong> {booking.date}
  </p>
  <p>{booking.package?.duration} itinerary</p>
  <p>
    <strong>Price:</strong> ₹{booking.package?.price || 'N/A'}
  </p>

    {booking.status === 'Pending' ?<button onClick={handlePayment}> 'Pay Now'  </button> :<h3>Paid 💸</h3>}
    <p id="status">
    <strong>Status:</strong> {booking.status}
  </p>
  
</DetailsCard>

        <ImagesSection>
          <h2>Destination Gallery</h2>
          {images.length > 0 ? (
            <ImagesContainer>
              {images.map((src, index) => (
                <Image
                key={index}
                src={src}
                alt="Destination"
                onClick={() =>
                  window.open(`https://www.google.com/maps/place/${booking.package?.destination}`, '_blank')
                }
              />
              
              ))}
            </ImagesContainer>
          ) : (
            <p>Loading images...</p>
          )}
        </ImagesSection>
        <Advertisement onClick={()=>navigate('/packages')}>Check out our latest packages !
            </Advertisement> </Container>
      <Footer />
    </div>
  );
};

export default BookingDetails;

// Styled Components
const Advertisement = styled.div`
    background:linear-gradient(90deg,
    rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.61),
    rgba(0, 0, 0, 0.79) 
  ), url('${bgad}');
    background-size: cover;
    height: 500px;
    margin-top: 60px;
    border-radius: 10px;
    text-align: center;
    font-size: 2.5rem;
    font-family:sans-serif;
    display: flex;
    font-weight: bold;
    justify-content: center;
    align-items: center;
    color: white;
    
    transition: all 0.3s ease;
      &:hover {
    transform: translateY(-10px);
    box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.2);
    }
}`;
const Container = styled.div`
  padding: 40px;
  padding-top: 80px;
  text-align: center;
 h3{
 text-align: left;
 color:teal;
 font-size: 1rem;}
  h1 {
    color: #212529;
    text-align: left;
    font-size: 2.5rem;
    margin-bottom: 20px;
  }
`;
const DetailsCard = styled.div`
  background:linear-gradient(-90deg,
    rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.61),
    rgba(0, 0, 0, 0.79) 
  ), ${({ backgroundImage }) => `url(${backgroundImage})`};
  background-size: cover;
  background-position: center;
  display:flex;
  flex-direction:column;
  gap:15px;
    text-align: left;
  color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  max-width: 1500px;
  height: 500px;
    margin: 0 auto;
    transition: all 0.3s ease;
    &:hover {
    transform: translateY(-10px);
    box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.2);
    }

  h2 {
    font-size: 1.5rem;
    margin-bottom: 10px;
    color:yellow;
  }

  p {
    font-size: 1rem;
    margin-bottom: 10px;
    color:rgba(201, 241, 251, 0.9);
  }

  #status {
    font-weight: bold;
    color: ${({ status }) => (status === 'Pending' ? 'red' : 'limegreen')};
  }

  button {
    background: teal;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;

    &:hover {
      background: darkcyan;
      color: yellow;
    }
  }
`;

const ImagesSection = styled.div`
  margin-top: 40px;

  h2 {
    color: teal;
    margin-bottom: 20px;
  }
`;

const ImagesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-auto-rows: 300px;
  gap: 15px;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.2);
  }
`;
