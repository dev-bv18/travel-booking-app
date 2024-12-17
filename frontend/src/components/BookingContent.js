import React from "react";
import styled from "styled-components";
import cart from "../assests/cart.jpg"; // Replace with the actual path
import packageImage from "../assests/package.jpg"; // Replace with the actual path
import journeyImage from "../assests/travel.jpg"; // Replace with the actual path for the new section image
import { useNavigate } from 'react-router-dom';

const BookingContent = () => {
  const navigate = useNavigate(); 
  const handleAllPackages = () => {
    navigate('/packages');
  };

  const handleUserCart = () => {
    navigate('/booking-history');
  };
  return (
    <ContentContainer>
      <SectionHeading>Seamless Travel Booking</SectionHeading>
      <MainHeading>Effortlessly browse and manage trips</MainHeading>
      <CardsContainer>
        <Card onClick={handleAllPackages}>
          <CardImage src={packageImage} alt="Browse travel packages"  />
          <CardContent>
            <CardTitle>Browse travel packages <Arrow>&gt;</Arrow></CardTitle>
            <CardDescription>
              Discover a variety of travel packages tailored to your needs.
            </CardDescription>
            <LearnMore href="#">Learn more</LearnMore>
          </CardContent>
        </Card>
        <Card onClick={handleUserCart}>
          <CardImage src={cart} alt="Book your trip" />
          <CardContent>
            <CardTitle>Your booked Travel Packages <Arrow>&gt;</Arrow></CardTitle>
            <CardDescription>
              All your Bookings in one place.
            </CardDescription>
            <LearnMore href="#">Learn more</LearnMore>
          </CardContent>
        </Card>
      </CardsContainer>

      {/* New Section */}
      <JourneySection>
        <JourneyImage src={journeyImage} alt="Your Journey Simplified" />
        <JourneyText>
          <JourneyHeading>Your Journey, Simplified</JourneyHeading>
          <JourneySubHeading>
            Experience seamless travel booking with us
          </JourneySubHeading>
        </JourneyText>
      </JourneySection>
    </ContentContainer>
  );
};

export default BookingContent;

// Styled Components
const ContentContainer = styled.div`
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionHeading = styled.h4`
  font-size: 1rem;
  color: teal;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 10px;
`;

const MainHeading = styled.h2`
  font-size: 2.5rem;
  color: #212529;
  font-weight: bold;
  margin-bottom: 40px;
`;

const CardsContainer = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const Card = styled.div`
  background:teal;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 48%; /* Adjust for two cards side by side */
  display: flex;
  cursor:pointer;
  flex-direction: column;
  transition:all 0.2s ease-in-out;

  @media (max-width: 768px) {
    width: 100%; /* Stacks cards on smaller screens */
  }
    &:hover {
    transform: translateY(-10px);
    box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.2);

    h3 {
      color:yellow;
    }
  }
    
`;

const CardImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const CardContent = styled.div`
  padding: 20px;
`;

const CardTitle = styled.h3`
  font-size: 1.2rem;
  color:rgb(255, 255, 255);
  font-weight: bold;
  margin-bottom: 10px;
`;

const CardDescription = styled.p`
  font-size: 1rem;
  color:rgb(173, 220, 213);
  margin-bottom: 20px;
`;

const LearnMore = styled.a`
  font-size: 1rem;
  color:rgb(212, 238, 235);
  font-weight: bold;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

/* New Section Styles */
const JourneySection = styled.div`
  margin-top: 60px;
  text-align: center;
`;

const JourneyImage = styled.img`
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
`;

const JourneyText = styled.div`
  margin-top: 20px;
`;

const JourneyHeading = styled.h4`
  font-size: 1rem;
  color:teal;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 10px;
`;

const JourneySubHeading = styled.h2`
  font-size: 2rem;
  color: #212529;
  font-weight: bold;
`;
const Arrow = styled.span`
  font-size: 1.2;
`;
