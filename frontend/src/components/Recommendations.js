import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY || 'your-unsplash-access-key';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);
  const autoScrollRef = useRef(null);
  const navigate = useNavigate();

  const userId = localStorage.getItem('user-id');
  const authToken = localStorage.getItem('auth-token');

  const fetchUnsplashImages = async (query, packageId) => {
    if (!query || !packageId) return;
    
    try {
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: { query, per_page: 1 },
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      });
      
      if (response.data && response.data.results && response.data.results.length > 0) {
        setImages(prevImages => ({
          ...prevImages,
          [packageId]: response.data.results[0].urls.regular
        }));
      }
    } catch (error) {
      console.error('Error fetching images from Unsplash:', error);
    }
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios({
        method: 'post',
        url: 'http://localhost:5000/recommend',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        data: {
          user_id: userId,
          auth_token: authToken,
        },
      });

      console.log('Recommendation response:', response);

      if (response.data && response.data.recommendations) {
        const validRecommendations = response.data.recommendations.filter(pkg => pkg !== null && pkg !== undefined);
        setRecommendations(validRecommendations);
        
        validRecommendations.forEach(pkg => {
          const query = pkg.destination || pkg.title || 'travel';
          const pkgId = pkg.id || (pkg.title ? `pkg-${pkg.title}` : `pkg-${Math.random().toString(36).substring(2, 9)}`);
          fetchUnsplashImages(query, pkgId);
        });
      } else {
        setError(response.data?.error || 'No recommendations found.');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);
        setError(err.response.data?.error || 'Failed to fetch recommendations.');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && authToken) {
      try {
        fetchRecommendations();
      } catch (err) {
        console.error("Error in recommendation effect:", err);
        setLoading(false);
        setError('An error occurred loading recommendations');
      }
    } else {
      setLoading(false);
      setError('Please log in to see recommendations');
    }
  }, [userId, authToken]);

  useEffect(() => {
    if (recommendations.length > 0) {
      autoScrollRef.current = setInterval(() => {
        setCurrentIndex(prevIndex => {
          const nextIndex = prevIndex + 1;
          return nextIndex >= recommendations.length ? 0 : nextIndex;
        });
      }, 3000);

      return () => {
        if (autoScrollRef.current) {
          clearInterval(autoScrollRef.current);
        }
      };
    }
  }, [recommendations.length]);

  useEffect(() => {
    if (carouselRef.current && recommendations.length > 0) {
      const scrollWidth = carouselRef.current.scrollWidth;
      const itemWidth = scrollWidth / recommendations.length;
      carouselRef.current.scrollTo({
        left: currentIndex * itemWidth,
        behavior: 'smooth'
      });
    }
  }, [currentIndex, recommendations.length]);

  const handleMouseEnter = () => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (recommendations.length > 0) {
      autoScrollRef.current = setInterval(() => {
        setCurrentIndex(prevIndex => {
          const nextIndex = prevIndex + 1;
          return nextIndex >= recommendations.length ? 0 : nextIndex;
        });
      }, 3000);
    }
  };

  const handlePackageClick = (pkg) => {
    if (pkg && pkg.id) {
      navigate(`/package-details/${pkg.id}`, { state: pkg });
    } else {
      navigate("/package-details", { state: { packageDetails: pkg } });
    }
  };

  const scrollToIndex = (index) => {
    setCurrentIndex(index);
  };

  if (!userId || !authToken) {
    return null;
  }

  if (loading) return <Loading>Loading recommendations</Loading>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  return (
    <RecommendationsContainer>
      <SectionTitle>Recommended For You</SectionTitle>
      
      {recommendations.length === 0 ? (
        <NoRecommendations>No recommendations available based on your booking history.</NoRecommendations>
      ) : (
        <CarouselContainer>
          <CarouselTrack 
            ref={carouselRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {recommendations.map((pkg, idx) => {
              if (!pkg) return null;
              
              const packageId = pkg.id || (pkg.title ? `pkg-${pkg.title}` : `pkg-${idx}`);
              const imageUrl = images[packageId] || pkg.image || '/default-package.jpg';
              
              return (
                <PackageCard 
                  key={`pkg-${idx}`} 
                  onClick={() => handlePackageClick(pkg)}
                  className={idx === currentIndex ? 'active' : ''}
                >
                  <CardInner style={{
  background: `linear-gradient(to left, rgba(0, 0, 0, 0.46), rgba(0, 0, 0, 0.88)), url(${imageUrl})`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  backgroundBlendMode: 'multiply',
  borderRadius: '24px',
  boxShadow: '0 12px 40px rgba(0, 128, 128, 0.3)',
  overflow: 'hidden',
  transition: 'all 0.4s ease-in-out',
}}
>
                    <ImageSection>
                      <PackageImage src={imageUrl} alt={pkg.title || 'Package'} />
                      <PriceTag>₹{pkg.price || '0'}</PriceTag>
                    </ImageSection>
                    
                    <ContentSection>
                      <PackageTitle>{pkg.title || 'Travel Package'}</PackageTitle>
                      <PackageDescription>{pkg.description.substring(0,60)+`...readmore` || 'Explore this amazing destination!'}</PackageDescription>
                      <PackageDestination>{pkg.destination || 'Destination'}</PackageDestination>
                      <ViewDetailsButton>Explore Now</ViewDetailsButton>
                    </ContentSection>
                  </CardInner>
                </PackageCard>
              );
            })}
          </CarouselTrack>
          
          <NavigationControls>
            <ProgressBar>
              <ProgressIndicator width={`${(currentIndex + 1) * (100 / recommendations.length)}%`} />
            </ProgressBar>
            
            <NavigationButtons>
              <NavButton 
                direction="prev" 
                onClick={() => scrollToIndex(currentIndex === 0 ? recommendations.length - 1 : currentIndex - 1)}
              >
                <ArrowIcon>&larr;</ArrowIcon>
              </NavButton>
              
              <SlideCounter>
                <CurrentSlide>{currentIndex + 1}</CurrentSlide>
                <TotalSlides>/ {recommendations.length}</TotalSlides>
              </SlideCounter>
              
              <NavButton 
                direction="next" 
                onClick={() => scrollToIndex(currentIndex === recommendations.length - 1 ? 0 : currentIndex + 1)}
              >
                <ArrowIcon>&rarr;</ArrowIcon>
              </NavButton>
            </NavigationButtons>
          </NavigationControls>
        </CarouselContainer>
      )}
    </RecommendationsContainer>
  );
};

// Modern styled components with enhanced teal theme and round shapes
const RecommendationsContainer = styled.section`
  padding: 80px 24px;
  max-width: 100%;
  overflow: hidden;
  border-radius: 24px;
`;
const PackageDescription = styled.p`
  font-size: 0.8rem;
  color: #e0f2f1;
  margin-bottom: 10px;
  line-height: 1.4;
  `;
const SectionTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 20px;
  text-align: center;
  color: #0f766e;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    width: 60px;
    height: 5px;
    background: linear-gradient(90deg, #0f766e, #5eead4);
    bottom: -16px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 9999px;
  }
`;

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
`;

const CarouselTrack = styled.div`
  display: flex;
  overflow-x: hidden;
  scroll-snap-type: x mandatory;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const PackageCard = styled.div`
  flex: 0 0 100%;
  scroll-snap-align: start;
  padding: 0 8px;
  opacity: 0.7;
  transform: scale(0.95);
  transition: all 0.5s ease;

  &.active {
    opacity: 1;
    transform: scale(1);
  }
`;

const CardInner = styled.div`
  display: flex;
  flex-direction: row;
  height: 320px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 15px 40px rgba(13, 148, 136, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    box-shadow: 0 25px 50px rgba(13, 148, 136, 0.15);
    transform: translateY(-6px);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
  }
`;

const ImageSection = styled.div`
  position: relative;
  flex: 0 0 60%;
  overflow: hidden;
  border-radius: 0 100% 0 0;

  @media (max-width: 768px) {
    height: 200px;
    flex: auto;
    border-radius: 24px 24px 0 0;
  }
`;

const PackageImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s ease;
  border-radius: inherit;

  ${CardInner}:hover & {
    transform: scale(1.05);
  }
`;

const PriceTag = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.9);
  color: #0f766e;
  padding: 10px 20px;
  font-weight: 700;
  font-size: 1.25rem;
  border-radius: 999px;
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.1);
`;

const ContentSection = styled.div`
  flex: 1;
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const PackageTitle = styled.h3`
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  margin-bottom: 10px;
  line-height: 1.3;
`;

const PackageDestination = styled.p`
  font-size: 1.1rem;
  color:rgb(168, 255, 251);
  margin-bottom: 20px;
  display: flex;
  align-items: center;

  &:before {
    content: '📍';
    margin-right: 8px;
  }
`;

const ViewDetailsButton = styled.button`
  background: teal;
  color: white;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  padding: 14px 28px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-start;

  &:hover {
    background: #0f766e;
    box-shadow: 0 6px 18px rgba(13, 148, 136, 0.3);
  }
`;

const NavigationControls = styled.div`
  margin-top: 40px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: #e0f2f1;
  border-radius: 9999px;
  margin-bottom: 24px;
  overflow: hidden;
`;

const ProgressIndicator = styled.div`
  height: 100%;
  width: ${props => props.width};
  background: linear-gradient(90deg, #5eead4, #0f766e);
  border-radius: 9999px;
  transition: width 0.3s ease;
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
`;

const NavButton = styled.button`
  background: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #ccfbf1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.05);

  &:hover {
    background: #0f766e;
    border-color: #0f766e;
    color: white;
    box-shadow: 0 8px 20px rgba(13, 148, 136, 0.25);
  }
`;

const ArrowIcon = styled.span`
  font-size: 1.2rem;
  line-height: 1;
`;

const SlideCounter = styled.div`
  display: flex;
  align-items: baseline;
`;

const CurrentSlide = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
`;

const TotalSlides = styled.span`
  font-size: 1rem;
  color: #64748b;
  margin-left: 4px;
`;

const Loading = styled.div`
  text-align: center;
  padding: 60px 0;
  font-size: 1.2rem;
  color: #64748b;
  position: relative;

  &:after {
    content: '';
    animation: ellipsis 1.5s infinite;
  }

  @keyframes ellipsis {
    0% { content: '.'; }
    33% { content: '..'; }
    66% { content: '...'; }
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 24px;
  color: #b91c1c;
  background: #fef2f2;
  border-radius: 12px;
  border-left: 6px solid #ef4444;
  margin: 30px auto;
  max-width: 800px;
`;

const NoRecommendations = styled.div`
  text-align: center;
  padding: 40px;
  color: #64748b;
  background: white;
  border-radius: 20px;
  margin: 0 auto;
  max-width: 800px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
`;


export default Recommendations;