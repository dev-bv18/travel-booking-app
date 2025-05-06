import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import banner from '../assests/banner1.webp';

const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const userId = localStorage.getItem('user-id');
  const authToken = localStorage.getItem('auth-token');

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/recommend', {
        user_id: userId,
        auth_token: authToken,
      });
      if (response.data && response.data.recommendations) {
        setRecommendations(response.data.recommendations);
      } else {
        setError(response.data?.error || 'No recommendations found.');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(
        err.response?.data?.error || 'Failed to fetch recommendations.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchImages = async () => {
      if (!recommendations.length) return;
      const newImages = {};
      for (const pkg of recommendations) {
        if (!images[pkg.destination]) {
          try {
            const response = await fetch(
              `https://api.unsplash.com/search/photos?query=${pkg.destination}&per_page=1&client_id=${UNSPLASH_ACCESS_KEY}`
            );
            const result = await response.json();
            newImages[pkg.destination] =
              result.results[0]?.urls?.regular || banner;
          } catch (err) {
            console.error(`Error fetching image for ${pkg.destination}:`, err);
            newImages[pkg.destination] = banner;
          }
        }
      }
      setImages((prev) => ({ ...prev, ...newImages }));
    };
    fetchImages();
  }, [recommendations]);

  useEffect(() => {
    if (userId && authToken) {
      fetchRecommendations();
    } else {
      setLoading(false);
      setError('Please log in to see recommendations');
    }
  }, [userId, authToken]);

  const handleBookNow = (pkg) => {
    navigate('/confirm-booking', { state: { packageDetails: pkg } });
  };

  if (!userId || !authToken) return null;
  if (loading) return <Loading>Loading recommendations...</Loading>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  return (
    <RecommendationsWrapper>
      <SectionHeading>Top Recommendations for You</SectionHeading>
      <PackageCardContainer>
        {recommendations.slice(0, 5).map((pkg) => (
          <Card key={pkg.id} className="cards">
            <PackageImage
              src={images[pkg.destination] || banner}
              alt={pkg.destination}
            />
            <CardContent className="box">
              <CardTitle>{pkg.title}</CardTitle>
              <CardDescription>{pkg.description}</CardDescription>
              <CardDescription id="price">
                <strike>₹{pkg.price + pkg.price * 0.5}</strike> ₹{pkg.price}
              </CardDescription>
              <CardDescription>{pkg.duration} itenary</CardDescription>
              <BookButton onClick={() => handleBookNow(pkg)}>
                Book Now ✈️
              </BookButton>
            </CardContent>
          </Card>
        ))}
      </PackageCardContainer>
    </RecommendationsWrapper>
  );
};

const RecommendationsWrapper = styled.div`
  padding: 60px 20px;
  text-align: center;
`;

const PackageCardContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;

  #price {
    color: rgb(0, 212, 35);
  }

  p {
    padding: 0px;
    margin: 2px;
  }

  #price strike {
    color: black;
  }

  .cards {
    display: flex;
    flex-direction: column;
  }

  .cards .box {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
`;

const PackageImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
`;

const SectionHeading = styled.h2`
  font-size: 2rem;
  color: rgb(26, 79, 92);
  font-weight: 600;
  margin-bottom: 20px;
`;

const BookButton = styled.button`
  background: teal;
  color: white;
  border: none;
  padding: 10px 20px;
  margin-top: 10px;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background: darkcyan;
    color: yellow;
  }
`;

const Card = styled.div`
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  width: 300px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: white;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.2);
    h3 {
      color: teal;
    }
  }
`;

const CardContent = styled.div`
  padding: 20px;
  background: white;
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  color: rgb(26, 79, 92);
  font-weight: bold;
  margin-bottom: 10px;
  transition: color 0.3s ease;
`;

const CardDescription = styled.p`
  font-size: 0.9rem;
  color: rgb(90, 90, 90);
  line-height: 1.5;
`;

const Loading = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #d9534f;
  background-color: #f8d7da;
  border-radius: 5px;
  margin: 20px auto;
  max-width: 600px;
`;

export default Recommendations;
