import React from "react";
import styled from "styled-components";
import bookingHeaderBg from "../assests/herobg.gif"; // Replace with the actual path to your image
import NavBar from "../pages/NavBar";

const BookingHeader = () => {
  return (
    <HeaderContainer>
      <NavBar/>
      <HeaderOverlay />
      <HeaderContent>
        <HeaderTitle>Seamless travel booking</HeaderTitle>
        <HeaderSubtitle>
          Explore, book, and manage your trips effortlessly.
        </HeaderSubtitle>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default BookingHeader;

// Styled Components
const HeaderContainer = styled.div`
  position: relative;
  height: 60vh;
  background-image: url(${bookingHeaderBg});
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HeaderOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5); /* Semi-transparent black overlay */
`;

const HeaderContent = styled.div`
  position: relative;
  text-align: center;
  color: white;
`;

const HeaderTitle = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 10px;
`;

const HeaderSubtitle = styled.p`
  font-size: 1.5rem;
  font-weight: 400;
`;
