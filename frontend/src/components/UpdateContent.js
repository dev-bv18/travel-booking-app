import React from "react";
import styled from "styled-components";
import updateImage from "../assests/img4.webp"; // Replace with the actual path to the image
import NavBar from "../pages/NavBar";
import Footer from "../pages/Footer";

const UpdateContent = () => {
  return (<div>
    <NavBar/>
    <Container>
      <ImageWrapper>
        <Image src={updateImage} alt="Real-Time Updates" />
      </ImageWrapper>
      <ContentWrapper>
        <Heading>Real-Time Updates</Heading>
        <Description>
          Stay ahead of the game with our Real-Time Updates feature, designed to
          keep you informed every step of the way. Travel can be unpredictable,
          but with instant notifications about flight changes, itinerary
          adjustments, and other important travel alerts, you can adapt swiftly
          to any situation. Our application not only enhances your travel
          experience but also provides a sense of security, ensuring you're
          always in the loop. Enjoy seamless communication and peace of mind
          while on the go, making your travels smoother and more enjoyable than
          ever before.
        </Description>
        <Button>Schedule Appointment</Button>
      </ContentWrapper>
    </Container>
    <Footer/>
  </div>
    
  );
};

export default UpdateContent;

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
  color: rgb(64, 91, 118);
  line-height: 1.8;
  margin-bottom: 30px;
`;

const Button = styled.button`
  background-color: teal;
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
