import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PayForm = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const validateForm = () => {
    const nameRegex = /^[A-Za-z]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nameRegex.test(formData.firstName)) {
      toast.error("First name should contain only alphabets.");
      return false;
    }

    if (!nameRegex.test(formData.lastName)) {
      toast.error("Last name should contain only alphabets.");
      return false;
    }

    if (!emailRegex.test(formData.email)) {
      toast.error("Invalid email format.");
      return false;
    }

    if (!phoneRegex.test(formData.phone)) {
      toast.error("Phone number must be 10 digits.");
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID,
      amount: state.totalAmount * 100,
      currency: "INR",
      name: "Travel Booking",
      description: `Payment for ${state.package.title}`,
      image: "https://yourlogo.com/logo.png",
      handler: function (response) {
        toast.success("Payment Successful!", {
          position: "bottom-right",
          autoClose: 2000,
        });

        setTimeout(() => {
          navigate("/payment-success", {
            replace: true,
            state: {
              paymentId: response.razorpay_payment_id,
              bookingId: state.id,
            },
          });
        }, 2000);
      },
      prefill: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        contact: `+91${formData.phone}`,
      },
      notes: {
        booking_id: state.id,
        package: state.package.title,
      },
      theme: {
        color: "#008080",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <>
      <NavBar />
      <Wrapper>
        <Card>
          <h2>Enter Your Details</h2>
          <FormGroup>
            <InputGroupRow>
              <InputBox>
                <label>First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder="John"
                />
              </InputBox>
              <InputBox>
                <label>Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder="Doe"
                />
              </InputBox>
            </InputGroupRow>

            <InputBox>
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="you@example.com"
              />
            </InputBox>

            <InputBox>
              <label>Phone Number</label>
              <PhoneInputContainer>
                <Flag>🇮🇳 +91</Flag>
                <input
                  type="tel"
                  maxLength="10"
                  pattern="[0-9]*"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })
                  }
                  placeholder="9876543210"
                />
              </PhoneInputContainer>
            </InputBox>

            <button onClick={handlePayment}>Pay ₹{state.totalAmount}</button>
          </FormGroup>
        </Card>
      </Wrapper>
      <ToastContainer />
      <Footer />
    </>
  );
};

export default PayForm;

// Styled Components
const Wrapper = styled.div`
  padding-top: 100px;
  display: flex;
  justify-content: center;
  min-height: 80vh;
  align-items: center;
`;

const Card = styled.div`
  background: #fff;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.1);
  text-align: left;
  max-width: 500px;
  width: 100%;

  h2 {
    color: teal;
    text-align: center;
    margin-bottom: 20px;
  }

  button {
    margin-top: 25px;
    width: 100%;
    padding: 12px;
    background: teal;
    color: white;
    font-size: 1rem;
    border: none;
    border-radius: 10px;
    cursor: pointer;

    &:hover {
      background: darkcyan;
      color: yellow;
    }
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const InputGroupRow = styled.div`
  display: flex;
  gap: 15px;
`;

const InputBox = styled.div`
  flex: 1;

  label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    color: teal;
  }

  input {
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 1rem;
    outline: none;

    &:focus {
      border-color: teal;
    }
  }
`;

const PhoneInputContainer = styled.div`
  display: flex;
  align-items: center;

  input {
    flex: 1;
    padding: 10px;
    margin-left: 8px;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    outline: none;

    &:focus {
      border-color: teal;
    }
  }
`;

const Flag = styled.div`
  font-size: 1rem;
  background: #f3f3f3;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
`;

