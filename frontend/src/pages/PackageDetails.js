import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import NavBar from './NavBar';
import Footer from './Footer';
import axios from 'axios';

const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;

const PackageDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pkg = location.state; // Access package details from state

  const [images, setImages] = useState([]);
  const [backgroundImage, setBackgroundImage] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top on component mount
    if (pkg?.destination) {
      fetchUnsplashImages(pkg.destination + ' tourism');
    }
  }, [pkg]);

  const fetchUnsplashImages = async (query) => {
    try {
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: { query, per_page: 8 },
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      });
      const imageUrls = response.data.results.map((img) => img.urls.regular);
      setImages(imageUrls);
      setBackgroundImage(imageUrls[0]); // Set the first image as the background
    } catch (error) {
      console.error('Error fetching images from Unsplash:', error);
    }
  };

  const handleBookNow = () => {
    navigate('/confirm-booking', { state: { packageDetails: pkg } });
  };

  return (
    <PageWrapper backgroundImage={backgroundImage}>
      <NavBar />
      <Container>
        <h3>Say hello to {pkg?.destination}! &#9992; </h3>
        <h1>Package Details</h1>
        <DetailsCard>
          <h2>{pkg?.title || 'Package Unavailable'} ~ {pkg?.destination || 'N/A'}</h2>
          <p>
            {pkg?.description}
          </p>
          <p>
            <strike>₹{pkg?.price+pkg?.price*0.50}</strike> ₹{pkg?.price || 'N/A'} <Alert>(tripify exclusive!✨)</Alert>
          </p>
          <p>
            {pkg?.duration} iternary specially curated for you! 🌟
          </p>
          <p>
            <strong>Availability:</strong>{' '}
            {pkg?.availability === 0 ? 'Unavailable' : `${pkg?.availability} slots`}
          </p>
          
          {pkg?.availability === 0 ? (
            <BookButton disabled>Unavailable</BookButton>
          ) : (
            <BookButton onClick={handleBookNow}>Book Now</BookButton>
          )}
        </DetailsCard>
        <ImagesSection>
          <h2>Destination Gallery</h2>
          {images.length > 0 ? (
            <ImagesContainer>
              {images.map((src, index) => (
                <ImageWrapper key={index}>
                  <Image
                    src={src}
                    alt="Destination"
                    style={{
                      gridRow: `span ${Math.ceil(Math.random() * 2)}`,
                      gridColumn: `span ${Math.ceil(Math.random() * 2)}`,
                    }}
                    onClick={() =>
                      window.open(`https://www.google.com/maps/place/${pkg.destination}`, '_blank')
                    }
                  />
                </ImageWrapper>
              ))}
            </ImagesContainer>
          ) : (
            <p>Loading images...</p>
          )}
        </ImagesSection>
      </Container>
      <Footer />
    </PageWrapper>
  );
};

export default PackageDetails;

// Styled Components
const Alert = styled.span`
color:white;
`;
const PageWrapper = styled.div`
  position: relative;
  min-height: 100vh;
  background: linear-gradient(
      rgba(0, 0, 0, 0.67),
      rgba(0, 0, 0, 0.7)
    ),
    url(${(props) => props.backgroundImage});
  background-size: cover;
  background-position: center;
  color: white;
`;

const Container = styled.div`
  padding: 40px;
  padding-top: 80px;
  text-align: center;
  h3 {
    text-align: left;
    color: teal;
    font-size: 1rem;
  }
  h1 {
    color: #ffffff;
    text-align: left;
    font-size: 2.5rem;
    margin-bottom: 20px;
  }
`;

const DetailsCard = styled.div`
  background: linear-gradient(
      -90deg,
      rgba(0, 0, 0, 0.35),
      rgba(0, 0, 0, 0.61),
      rgba(0, 0, 0, 0.79)
    ),
    url('https://source.unsplash.com/1600x900/?travel');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  gap: 15px;
  text-align: left;
  color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  max-width: 1500px;
  margin: 0 auto;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.2);
  }

  h2 {
    font-size: 1.5rem;
    margin-bottom: 10px;
    color: yellow;
  }

  p {
    font-size: 1rem;
    margin-bottom: 10px;
    color: rgba(201, 241, 251, 0.9);
  }
`;

const BookButton = styled.button`
  background: teal;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;

  &:disabled {
    background: rgb(1, 76, 68);
    color: grey;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: darkcyan;
    color: yellow;
  }
`;

const ImagesSection = styled.div`
  margin-top: 40px;

  h2 {
    color: white;
    margin-bottom: 20px;
  }
`;

const ImagesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-auto-rows: 300px;
  gap: 10px;
`;

const ImageWrapper = styled.div`
  overflow: hidden;
  border-radius: 10px;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;
