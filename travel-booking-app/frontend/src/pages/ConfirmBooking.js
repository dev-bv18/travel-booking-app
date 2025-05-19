import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import styled from "styled-components";
import { BOOK_PACKAGE } from "../graphql/mutation";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ConfirmBooking = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [bookPackage] = useMutation(BOOK_PACKAGE);

  const additionalCharges = 200;
  const totalPrice = state.packageDetails.price + additionalCharges;

  const toastOptions = {
    position: "bottom-right",
    autoClose: 3000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  const handlePayNow = async () => {
    if (!termsAccepted) {
      toast.error("You must accept the terms and conditions.", toastOptions);
      return;
    }

    const userId = localStorage.getItem("user-id");

    if (!userId) {
      toast.error("Login required to confirm booking.", toastOptions);
      setTimeout(() => navigate("/auth"), 3000);
      return;
    }

    try {
      const { data } = await bookPackage({
        variables: {
          packageId: state.packageDetails.id,
          userId,
          date: new Date().toISOString().split("T")[0],
          status: "Pending",
        },
      });

      if (data?.bookPackage) {
        toast.success("Redirecting to payment...", toastOptions);
        setTimeout(() => {
          navigate("/payment", {
            state: {
              id: data.bookPackage.id,
              userId,
              status: "Pending",
              date: new Date().toISOString().split("T")[0],
              package: state.packageDetails,
              totalAmount: totalPrice,
            },
          });
        }, 2000);
      } else {
        toast.error("Booking failed. Try again.", toastOptions);
      }
    } catch (err) {
      console.error("Booking error:", err);
      toast.error("An error occurred during booking.", toastOptions);
    }
  };

  return (
    <>
      <NavBar />
      <Container>
        <h1>Confirm Your Booking</h1>
        <PackageDetails>
          <h2>Booking Details</h2>
          <p><strong>Package:</strong> {state.packageDetails.title}</p>
          <p><strong>Destination:</strong> {state.packageDetails.destination}</p>
          <p><strong>Duration:</strong> {state.packageDetails.duration}</p>
          <p><strong>Price:</strong> ₹{state.packageDetails.price}</p>
          <p><strong>Additional Charges:</strong> ₹{additionalCharges}</p>
          <p className="total-price"><strong>Total:</strong> ₹{totalPrice}</p>
        </PackageDetails>

        <Options>
          <label>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            I agree to the <a href="/terms" target="_blank">terms and conditions</a>.
          </label>
          <PayButton onClick={handlePayNow}>
            Pay ₹{totalPrice} and Confirm Booking
          </PayButton>
        </Options>
      </Container>
      <ToastContainer />
      <Footer />
    </>
  );
};

export default ConfirmBooking;

// Styled Components
const Container = styled.div`
  padding: 40px;
  padding-top: 100px;
  text-align: center;

  h1 {
    color: teal;
    margin-bottom: 20px;
  }
`;

const PackageDetails = styled.div`
  background: teal;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.17);
  max-width: 400px;
  margin: 0 auto;
  text-align: left;

  h2 {
    color: yellow;
    font-size: 1.5rem;
    margin-bottom: 10px;
  }

  p {
    font-size: 1rem;
    color: white;
    margin: 5px 0;
  }

  .total-price {
    font-weight: bold;
    font-size: 1.2rem;
    color: rgb(89, 253, 89);
  }
`;

const Options = styled.div`
  margin-top: 20px;
  max-width: 400px;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 15px;

  label {
    color: teal;
    font-size: 0.95rem;

    a {
      color: blue;
      text-decoration: underline;
    }
  }
`;

const PayButton = styled.button`
  padding: 12px 24px;
  background-color: teal;
  color: white;
  border: none;
  border-radius: 15px;
  font-size: 1.1rem;
  cursor: pointer;
  align-self: center;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: darkcyan;
    color: yellow;
  }
`;