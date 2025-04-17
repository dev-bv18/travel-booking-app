import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const userId = localStorage.getItem('user-id');
  const authToken = localStorage.getItem('auth-token');

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
          user_id: userId, // Corrected to match backend key
          auth_token: authToken, // Corrected to match backend key
        },
      });

      console.log('Recommendation response:', response);  // Add this for debugging

      if (response.data && response.data.recommendations) {
        setRecommendations(response.data.recommendations);  // Adjusted to the backend response structure
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
      fetchRecommendations();
    } else {
      setLoading(false);
      setError('Please log in to see recommendations');
    }
  }, [userId, authToken]);

  const handlePackageClick = (pkg) => {
    navigate("/confirm-booking", { state: { packageDetails: pkg } });
  };

  if (!userId || !authToken) {
    return null; // Don't show recommendations if user is not logged in
  }

  if (loading) return <Loading>Loading recommendations...</Loading>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  return (
    <RecommendationsContainer>
      <Title>Recommended For You</Title>
      {recommendations.length === 0 ? (
        <NoRecommendations>No recommendations available based on your booking history.</NoRecommendations>
      ) : (
        <PackageGrid>
          {recommendations.map((pkg, idx) => (
            <PackageCard key={idx} onClick={() => handlePackageClick(pkg)}>
              <PackageImage src={pkg.image || '/default-package.jpg'} alt={pkg.title} />
              <PackageContent>
                <PackageTitle>{pkg.title}</PackageTitle>
                <PackageDestination>{pkg.destination}</PackageDestination>
                <PackagePrice>₹{pkg.price}</PackagePrice>
              </PackageContent>
            </PackageCard>
          ))}
        </PackageGrid>
      )}
    </RecommendationsContainer>
  );
};

// Styled components
const RecommendationsContainer = styled.div`
  padding: 40px 20px;
  background-color: #f8f9fa;
  margin-top: 40px;
`;

const Title = styled.h2`
  font-size: 2rem;
  color: teal;
  text-align: center;
  margin-bottom: 30px;
`;

const PackageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  max-width: 1200px;
  margin: 0 auto;
`;

const PackageCard = styled.div`
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const PackageImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
`;

const PackageContent = styled.div`
  padding: 20px;
`;

const PackageTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 8px;
`;

const PackageDestination = styled.p`
  color: #666;
  margin-bottom: 12px;
`;

const PackagePrice = styled.p`
  font-weight: bold;
  color: teal;
  font-size: 1.1rem;
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

const NoRecommendations = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
`;

export default Recommendations;
