import React from "react";
import styled from "styled-components";
import secureImage from "../assests/img3.webp"; // Replace with the actual path to the image
import NavBar from "../pages/NavBar";
import Footer from "../pages/Footer";

const SecureContent = () => {
  return (<div>
      <NavBar/>
 <Container>
      <ImageWrapper>
        <Image src={secureImage} alt="Secure Travel Management" />
      </ImageWrapper>
      <ContentWrapper>
        <Heading>Secure Travel Management</Heading>
        <Description>
          Take control of your travel experience with our Secure Travel Management feature. 
          You can effortlessly manage and modify your travel bookings all in one place, 
          ensuring peace of mind throughout your journey. Our application employs 
          state-of-the-art security measures to protect your personal information and 
          financial data, so you can focus on what truly matters – enjoying your travels. 
          With real-time updates and notifications, stay informed about your itinerary 
          changes and important alerts. Empower yourself to navigate your travel plans 
          with confidence and ease.
        </Description>
        <Button>Schedule Appointment</Button>
      </ContentWrapper>
    </Container>
    <Footer/>
  </div>
   
  );
};

export default SecureContent;

// Styled Components
const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: 40px;
  padding-top:80px;
  background-color: #f9f9f9;
`;

const ImageWrapper = styled.div`
  flex: 1;
  text-align: center;

  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const Image = styled.img`
  max-width: 90%;
  height: auto;
  border-radius: 8px;
`;

const ContentWrapper = styled.div`
  flex: 1;
  max-width: 600px;
  padding: 0 20px;

  @media (max-width: 768px) {
    padding: 0;
  }
`;

const Heading = styled.h3`
  color: teal;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  text-transform: uppercase;
`;

const Description = styled.p`
  font-size: 1rem;
  color:rgb(64, 91, 118);
  line-height: 1.8;
  margin-bottom: 30px;
`;

const Button = styled.button`
  background-color:teal;
  color: white;
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color:rgb(16, 67, 75);
    color:yellow;
  }
`;
