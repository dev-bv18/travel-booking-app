import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Slider from 'react-slick';
import { useQuery } from '@apollo/client';
import { GET_PACKAGES } from '../graphql/queries';
import NavBar from './NavBar';
import Footer from './Footer';
import axios from 'axios';

const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;

const PackageDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pkg = location.state;

  const { data: packagesData, loading: packagesLoading } = useQuery(GET_PACKAGES);

  const [images, setImages] = useState([]);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [randomPackages, setRandomPackages] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (pkg?.destination) {
      fetchUnsplashImages(pkg.destination + ' tourism');
    }
  }, [pkg]);

  useEffect(() => {
    if (packagesData?.getPackages) {
      const filteredPackages = packagesData.getPackages.filter((p) => p.id !== pkg.id);
      const shuffled = filteredPackages.sort(() => 0.5 - Math.random());
      setRandomPackages(shuffled.slice(0, 3));
    }
  }, [packagesData, pkg]);

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
      setBackgroundImage(imageUrls[Math.floor(Math.random() * imageUrls.length)]);
    } catch (error) {
      console.error('Error fetching images from Unsplash:', error);
    }
  };

  const handleBookNow = () => {
    navigate('/confirm-booking', { state: { packageDetails: pkg } });
  };

  const handlePackageClick = (packageDetails) => {
    navigate(`/package-details/${packageDetails.id}`, { state: packageDetails });
  };

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <PageWrapper backgroundImage={backgroundImage}>
      <NavBar />
      <Container>
        <h3>Say hello to {pkg?.destination}! &#9992; </h3>
        <h1>Package Details</h1>
        <DetailsCard>
          <h2>{pkg?.title || 'Package Unavailable'} ~ {pkg?.destination || 'N/A'}</h2>
          <p>{pkg?.description}</p>
          <p>
            <strike>₹{pkg?.price + pkg?.price * 0.5}</strike> ₹{pkg?.price || 'N/A'}{' '}
            <Alert>(Tripify Exclusive!✨)</Alert>
          </p>
          <p>{pkg?.duration} itinerary specially curated for you! 🌟</p>
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
          <h2>Destination Gallery &#9992;</h2>
          {images.length > 0 ? (
            <Carousel {...carouselSettings}>
              {images.map((src, index) => (
                <ImageWrapper key={index}>
                  <Image
                    src={src}
                    alt="Destination"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/place/${pkg.destination}`,
                        '_blank'
                      )
                    }
                  />
                </ImageWrapper>
              ))}
            </Carousel>
          ) : (
            <p>Loading images...</p>
          )}
        </ImagesSection>
        <RelatedPackagesSection>
          <h2>Other Packages You May Like &#9992;</h2>
          {packagesLoading ? (
            <p>Loading packages...</p>
          ) : (
            <RelatedPackagesContainer>
              {randomPackages.map((packageDetails) => (
                <PackageCard
                  key={packageDetails.id}
                  onClick={() => handlePackageClick(packageDetails)}
                >
                  <CardContent>
                    <h3>{packageDetails.title}</h3>
                    <p>{packageDetails.destination}</p>
                    <p>{packageDetails.duration} itinerary</p>
                    <p><strike>₹{packageDetails.price+packageDetails.price*0.50}</strike> ₹{packageDetails.price}</p>
                    <a href={`/package-details/${packageDetails.id}`}>View Details</a>
                  </CardContent>
                </PackageCard>
              ))}
            </RelatedPackagesContainer>
          )}
        </RelatedPackagesSection>
      </Container>
      <Footer />
    </PageWrapper>
  );
};

export default PackageDetails;

// Styled Components
const Alert = styled.span`
  color: yellow;
`;

const PageWrapper = styled.div`
  position: relative;
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  color: white;
`;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
const Container = styled.div`
  padding: 40px;
  padding-top: 80px;
  h3{
  color:teal;}  
h1{
 color: rgb(26, 79, 92);
}                                                                                                                                                                                                                                                                                                 }
`;

const DetailsCard = styled.div`
  background: teal;
  text-align: left;
  color: white;
  border-radius: 10px;
  padding: 20px;
  max-width: 1500px;
  margin: 0 auto;
`;

const BookButton = styled.button`
  background: white;
  color:teal;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  &:hover{
    color:yellow;
    background:rgba(0, 55, 67, 0.9); }
`;

const ImagesSection = styled.div`
  margin-top: 40px;
  h2 {
    color:teal;
    margin-bottom: 20px;
  }
`;

const Carousel = styled(Slider)`
  .slick-slide img {
    border-radius: 10px;
  }
`;

const ImageWrapper = styled.div`
  padding: 10px;
  transition: transform 0.3s ease;
`;

const Image = styled.img`
  width: 90%;
  height: 400px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    border: 2px solid yellow;
    box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.2);
  }
  
`;

const RelatedPackagesSection = styled.div`
  margin-top: 40px;
  h2 {
    color: teal;
    margin-bottom: 20px;
  }
`;

const RelatedPackagesContainer = styled.div`
  display: flex;
  gap: 20px;
  justify-content: space-between;
`;

const PackageCard = styled.div`
  background: white;
  border-radius: 10px;
  border: 1px solid teal;
  width:500px;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.2);
  }
`;

const CardContent = styled.div`
  h3 {
    font-size: 1.2rem;
    color: teal;
  }
strike{
  color:grey;
}
  p {
    font-size: 1rem;
    color: #555;
  }
  a{
  background: teal;
  color: white;
  padding: 10px 20px;
  text-decoration: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  float:right;
  }
`;
