import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const BookingFooter = () => {
  const navigate = useNavigate();

  const handleGetInTouch = () => {
    // Navigate to HomePage with hash to the "Get in touch" section
    navigate("/#contact");
  };

  return (
    <FooterContainer>
      <FooterContent>
        <FooterHeading>GET IN TOUCH</FooterHeading>
        <FooterSubHeading>Start your travel journey today! &#9992;</FooterSubHeading>
        <FooterButton onClick={handleGetInTouch}>CONTACT NOW</FooterButton>
      </FooterContent>
      <FooterLinks>
        <FooterLink href="#">Schedule Appointment</FooterLink>
        <FooterLink href="#">Complete Intake</FooterLink>
        <FooterLink href="#">Privacy Policy</FooterLink>
      </FooterLinks>
    </FooterContainer>
  );
};

export default BookingFooter;

// Styled Components
const FooterContainer = styled.footer`
  background-color: #121212;
  color: #ffffff;
  padding: 40px 20px;
  text-align: center;
`;

const FooterContent = styled.div`
  margin-bottom: 30px;
`;

const FooterHeading = styled.h3`
  font-size: 0.9rem;
  font-weight: bold;
  text-transform: uppercase;
  color: #f0f8ff;
  margin-bottom: 10px;
`;

const FooterSubHeading = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  color: #f0f8ff;
`;

const FooterButton = styled.button`
  background: transparent;
  color: #ffffff;
  border: 2px solid #ffffff;
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #ffffff;
    color: #121212;
  }
`;

const FooterLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
`;

const FooterLink = styled.a`
  color: #ffffff;
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: #f0f8ff;
    text-decoration: underline;
  }
`;
