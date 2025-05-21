import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const ThemeRecommendations = () => {
  const [themes, setThemes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/recommend-themes');
        if (response.data.success) {
          setThemes(response.data.themes);
        } else {
          setError('Failed to load themes');
        }
      } catch (err) {
        console.error(err);
        setError('Error fetching themes');
      } finally {
        setLoading(false);
      }
    };

    fetchThemes();
  }, []);

  if (loading) return <p className="theme-loading">Loading theme recommendations...</p>;
  if (error) return <p className="theme-error">{error}</p>;

  return (
    <Container>
      <SectionHeading>Top Picks by Travel Theme</SectionHeading>
      {Object.entries(themes).map(([themeName, packages]) => (
        <div key={themeName} className="theme-category">
          <ThemeTitle>{themeName.charAt(0).toUpperCase() + themeName.slice(1)} Escapes</ThemeTitle>
          <PackageCardContainer>
            {packages.map((pkg, index) => (
              <Card key={index} className="cards">
                <ThemeImage
                  src={pkg.image || '/default-package.jpg'}
                  alt={pkg.title}
                />
                <CardContent className="box">
                  <CardTitle>{pkg.title}</CardTitle>
                  <CardDescription>{pkg.destination}</CardDescription>
                  <CardDescription id="price">₹{pkg.price.toLocaleString()}</CardDescription>
                  <CardDescription>⭐ {pkg.rating || '4+'}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </PackageCardContainer>
        </div>
      ))}
    </Container>
  );
};

export default ThemeRecommendations;

const Container = styled.div`
  padding: 10px 20px;
  text-align: center;
  background: #f5f5f5;
`;

const SectionHeading = styled.h2`
  font-size: 2rem;
  color: rgb(26, 79, 92);
  font-weight: 600;
  margin-bottom: 20px;
`;

const ThemeTitle = styled.h3`
  font-size: 1.6rem;
  color: teal;
  font-weight: bold;
  margin: 20px 0;
`;

const PackageCardContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
`;

const Card = styled.div`
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  width: 300px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: teal;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.2);
    h3 {
      color: rgb(0, 44, 62);
    }
  }
`;

const ThemeImage = styled.img`
  width: 300px;
  height: 200px;
  object-fit: cover;
`;

const CardContent = styled.div`
  padding: 20px;
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  color: rgb(255, 255, 255);
  font-weight: bold;
  margin-bottom: 10px;
  transition: color 0.3s ease;
`;

const CardDescription = styled.p`
  font-size: 0.9rem;
  color: rgb(161, 203, 190);
  line-height: 1.5;
`;