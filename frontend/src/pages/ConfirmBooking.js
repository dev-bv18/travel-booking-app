import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import styled from "styled-components";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { BOOK_PACKAGE, CREATE_PAYMENT_INTENT, CONFIRM_PAYMENT } from "../graphql/mutation";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const stripePromise = loadStripe('pk_test_51RVVPxC0TNhxixUa2of2r6l3ACgw581RTqeXfEmGNv6LUXRviqEI0EpT8VJa70xFapUidEcPWlWjyf3gBWbdNP0H00YQaM3HIT');

const PaymentForm = ({ 
  packageDetails, 
  totalPrice, 
  formData, 
  onPaymentSuccess, 
  onPaymentError 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [createPaymentIntent] = useMutation(CREATE_PAYMENT_INTENT);
  const [confirmPayment] = useMutation(CONFIRM_PAYMENT);
  const [bookPackage] = useMutation(BOOK_PACKAGE);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");

  const toastOptions = {
    position: "bottom-right",
    autoClose: 3000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  // Create payment intent when component mounts
  useEffect(() => {
    const createIntent = async () => {
      console.log("🚀 Starting payment intent creation...");
      
      const userId = localStorage.getItem("user-id");
      console.log("👤 User ID from localStorage:", userId);
      console.log("📦 Package details:", packageDetails);
      console.log("💰 Total price:", totalPrice);
      
      if (!userId) {
        console.error("❌ No user ID found in localStorage");
        toast.error("User not logged in. Please log in to continue.", toastOptions);
        return;
      }
      
      if (!packageDetails) {
        console.error("❌ No package details provided");
        toast.error("Package details missing. Please try again.", toastOptions);
        return;
      }

      if (!packageDetails.id) {
        console.error("❌ Package ID is missing from package details:", packageDetails);
        toast.error("Invalid package selected. Please try again.", toastOptions);
        return;
      }

      if (!totalPrice || totalPrice <= 0) {
        console.error("❌ Invalid total price:", totalPrice);
        toast.error("Invalid price amount. Please try again.", toastOptions);
        return;
      }

      console.log("📝 Creating payment intent with variables:", {
        packageId: packageDetails.id,
        userId,
        amount: totalPrice,
        currency: "inr"
      });

      // Also log the types to make sure they're correct
      console.log("🔍 Variable types:", {
        packageIdType: typeof packageDetails.id,
        userIdType: typeof userId,
        amountType: typeof totalPrice,
        currencyType: typeof "inr",
        packageIdValue: packageDetails.id,
        userIdValue: userId,
        amountValue: totalPrice
      });

      try {
        const { data, error } = await createPaymentIntent({
          variables: {
            packageId: packageDetails.id,
            userId,
            amount: totalPrice,
            currency: "inr"
          }
        });

        console.log("📊 GraphQL mutation response:", { data, error });

        if (error) {
          console.error("❌ GraphQL mutation error:", error);
          console.error("Error details:", {
            message: error.message,
            graphQLErrors: error.graphQLErrors,
            networkError: error.networkError
          });
          
          toast.error(`GraphQL Error: ${error.message}`, toastOptions);
          return;
        }

        if (data?.createPaymentIntent) {
          console.log("✅ Payment intent created successfully:", data.createPaymentIntent);
          
          const { clientSecret: newClientSecret, paymentIntentId: newPaymentIntentId } = data.createPaymentIntent;
          
          if (!newClientSecret) {
            console.error("❌ No client secret in response:", data.createPaymentIntent);
            toast.error("Invalid payment response. Please try again.", toastOptions);
            return;
          }

          if (!newPaymentIntentId) {
            console.error("❌ No payment intent ID in response:", data.createPaymentIntent);
            toast.error("Invalid payment response. Please try again.", toastOptions);
            return;
          }

          setClientSecret(newClientSecret);
          setPaymentIntentId(newPaymentIntentId);
          console.log("🔑 Client secret set:", newClientSecret);
          console.log("🆔 Payment intent ID set:", newPaymentIntentId);
        } else {
          console.error("❌ No createPaymentIntent data in response:", data);
          toast.error("Failed to initialize payment. Invalid server response.", toastOptions);
        }
      } catch (error) {
        console.error("❌ Exception during payment intent creation:", error);
        console.error("Error stack:", error.stack);
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        
        // Check for network errors
        if (error.networkError) {
          console.error("🌐 Network error details:", error.networkError);
          console.error("Network error status:", error.networkError.statusCode);
          console.error("Network error result:", error.networkError.result);
        }

        // Check for GraphQL errors
        if (error.graphQLErrors && error.graphQLErrors.length > 0) {
          console.error("📋 GraphQL errors:", error.graphQLErrors);
          error.graphQLErrors.forEach((gqlError, index) => {
            console.error(`GraphQL Error ${index + 1}:`, {
              message: gqlError.message,
              locations: gqlError.locations,
              path: gqlError.path,
              extensions: gqlError.extensions
            });
          });
        }

        toast.error("Failed to initialize payment. Please try again.", toastOptions);
      }
    };

    console.log("🔄 Payment intent useEffect triggered");
    createIntent();
  }, [packageDetails, totalPrice, createPaymentIntent]);

  const handlePayment = async (e) => {
    e.preventDefault();
    console.log("💳 Starting payment process...");

    if (!stripe || !elements || !clientSecret) {
      console.log("❌ Payment prerequisites check:", {
        stripe: !!stripe,
        elements: !!elements,
        clientSecret: !!clientSecret
      });
      toast.error("Payment system not ready. Please wait.", toastOptions);
      return;
    }

    setProcessing(true);
    const userId = localStorage.getItem("user-id");
    console.log("👤 Processing payment for user:", userId);

    try {
      console.log("📝 Creating booking with variables:", {
        packageId: packageDetails.id,
        userId,
        date: formData.date,
        status: "Pending",
        totalAmount: totalPrice,
        paymentId: paymentIntentId,
        paymentStatus: "pending"
      });

      // First create the booking
      const bookingResult = await bookPackage({
        variables: {
          packageId: packageDetails.id,
          userId,
          date: formData.date,
          status: "Pending",
          totalAmount: totalPrice,
          paymentId: paymentIntentId,
          paymentStatus: "pending"
        }
      });

      console.log("📋 Booking result:", bookingResult);

      if (!bookingResult.data?.bookPackage) {
        console.error("❌ Failed to create booking:", bookingResult);
        throw new Error("Failed to create booking");
      }

      const bookingId = bookingResult.data.bookPackage.id;
      console.log("✅ Booking created with ID:", bookingId);

      console.log("💳 Confirming card payment with Stripe...");
      // Process payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: formData.name,
            email: formData.email,
          },
        },
      });

      console.log("🎯 Stripe payment result:", { error, paymentIntent });

      if (error) {
        console.error("❌ Stripe payment error:", error);
        toast.error(`Payment failed: ${error.message}`, toastOptions);
        onPaymentError(error);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        console.log("✅ Payment succeeded, confirming with backend...");
        
        // Confirm payment in backend
        const confirmResult = await confirmPayment({
          variables: {
            bookingId,
            paymentIntentId: paymentIntent.id
          }
        });

        console.log("📋 Payment confirmation result:", confirmResult);

        if (confirmResult.data?.confirmPayment) {
          console.log("✅ Payment confirmed successfully");
          toast.success(`Payment successful! Booking confirmed for ${packageDetails.title}`, toastOptions);
          onPaymentSuccess(confirmResult.data.confirmPayment);
        } else {
          console.error("❌ Payment confirmation failed:", confirmResult);
          toast.error("Payment processed but confirmation failed. Please contact support.", toastOptions);
        }
      } else {
        console.log("⚠️ Payment intent status:", paymentIntent.status);
      }
    } catch (error) {
      console.error("❌ Payment processing error:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      toast.error("Payment processing failed. Please try again.", toastOptions);
      onPaymentError(error);
    } finally {
      setProcessing(false);
      console.log("🏁 Payment processing completed");
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
    },
  };

  return (
    <PaymentFormContainer>
      <h3>Payment Details</h3>
      <form onSubmit={handlePayment}>
        <CardElementContainer>
          <CardElement options={cardElementOptions} />
        </CardElementContainer>
        
        <PaymentButton type="submit" disabled={!stripe || processing}>
          {processing ? (
            <LoadingSpinner>Processing...</LoadingSpinner>
          ) : (
            `Pay ₹${totalPrice} and Confirm Booking`
          )}
        </PaymentButton>
      </form>
    </PaymentFormContainer>
  );
};

const ConfirmBooking = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [bookPackage] = useMutation(BOOK_PACKAGE);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Check if state exists and redirect if not
  useEffect(() => {
    console.log("🔍 Checking navigation state:", state);
    
    if (!state || !state.packageDetails) {
      console.error("❌ No package details in navigation state");
      toast.error("No package selected. Redirecting to packages page.", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
      navigate("/packages");
    } else {
      console.log("✅ Package details found:", state.packageDetails);
    }
  }, [state, navigate]);

  const [formData, setFormData] = useState({
    name: localStorage.getItem("username") || "",
    email: localStorage.getItem("email") || "",
    date: new Date().toISOString().split("T")[0],
  });

  console.log("📝 Form data initialized:", formData);

  // Early return if no state
  if (!state || !state.packageDetails) {
    console.log("⏳ Waiting for state to load...");
    return <div>Loading...</div>;
  }

  const additionalCharges = 200;
  const totalPrice = state.packageDetails.price + additionalCharges;
  
  console.log("💰 Price calculation:", {
    packagePrice: state.packageDetails.price,
    additionalCharges,
    totalPrice
  });
  
  const toastOptions = {
    position: "bottom-right",
    autoClose: 3000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`📝 Form field changed: ${name} = ${value}`);
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    console.log("☑️ Terms checkbox changed:", e.target.checked);
    setTermsAccepted(e.target.checked);
  };

  const handlePayLater = async (e) => {
    e.preventDefault();
    console.log("⏰ Pay Later clicked");
    
    if (!termsAccepted) {
      console.log("❌ Terms not accepted");
      toast.error("You must accept the terms and conditions to proceed.", toastOptions);
      return;
    }
    
    const userId = localStorage.getItem("user-id");
    console.log("👤 Pay Later - User ID:", userId);
    
    if (!userId) {
      console.error("❌ No user ID for Pay Later");
      toast.error("You must be logged in to confirm booking.", toastOptions);
      navigate("/auth");
      return;
    }

    try {
      console.log("📝 Creating Pay Later booking with variables:", {
        packageId: state.packageDetails.id,
        userId,
        date: formData.date,
        status: "Pending",
        totalAmount: totalPrice,
        paymentStatus: "pending"
      });

      const { data } = await bookPackage({
        variables: {
          packageId: state.packageDetails.id,
          userId,
          date: formData.date,
          status: "Pending",
          totalAmount: totalPrice,
          paymentStatus: "pending"
        },
      });

      console.log("📋 Pay Later booking result:", data);

      if (data?.bookPackage) {
        console.log("✅ Pay Later booking successful");
        toast.success(`Your booking for ${state.packageDetails.title} has been saved as pending.`, toastOptions);
        setTimeout(() => {
          navigate(`/booking-history/${userId}`);
        }, 3000);
      } else {
        console.error("❌ Pay Later booking failed:", data);
        toast.error("Failed to save booking. Please try again.", toastOptions);
      }
    } catch (err) {
      console.error("❌ Pay Later error:", err);
      console.error("Error details:", {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      toast.error("An error occurred while saving the booking.", toastOptions);
    }
  };

  const handlePayNow = (e) => {
    e.preventDefault();
    console.log("💳 Pay Now clicked");
    
    if (!termsAccepted) {
      console.log("❌ Terms not accepted for Pay Now");
      toast.error("You must accept the terms and conditions to proceed.", toastOptions);
      return;
    }

    const userId = localStorage.getItem("user-id");
    console.log("👤 Pay Now - User ID:", userId);
    
    if (!userId) {
      console.error("❌ No user ID for Pay Now");
      toast.error("You must be logged in to confirm booking.", toastOptions);
      setTimeout(() => {
        navigate("/auth");
      }, 3000);
      return;
    }

    console.log("🎯 Showing payment form");
    setShowPayment(true);
  };

  const onPaymentSuccess = (booking) => {
    console.log("✅ Payment success callback:", booking);
    const userId = localStorage.getItem("user-id");
    setTimeout(() => {
      navigate(`/booking-history/${userId}`);
    }, 3000);
  };

  const onPaymentError = (error) => {
    console.error("❌ Payment error callback:", error);
    setShowPayment(false);
  };

  if (showPayment) {
    console.log("💳 Rendering payment form");
    return (
      <div>
        <NavBar />
        <Container>
          <h1>Complete Your Payment</h1>
          <PackageDetails>
            <h2>Booking Summary</h2>
            <p><strong>Package:</strong> {state.packageDetails.title}</p>
            <p><strong>Destination:</strong> {state.packageDetails.destination}</p>
            <p><strong>Duration:</strong> {state.packageDetails.duration}</p>
            <p><strong>Price:</strong> ₹{state.packageDetails.price}</p>
            <p><strong>Additional Charges:</strong> ₹{additionalCharges} (Service & Tax)</p>
            <p className="total-price"><strong>Total Price:</strong> ₹{totalPrice}</p>
          </PackageDetails>

          <Elements stripe={stripePromise}>
            <PaymentForm
              packageDetails={state.packageDetails}
              totalPrice={totalPrice}
              formData={formData}
              onPaymentSuccess={onPaymentSuccess}
              onPaymentError={onPaymentError}
            />
          </Elements>

          <BackButton onClick={() => setShowPayment(false)}>
            ← Back to Booking Details
          </BackButton>
        </Container>
        <ToastContainer />
        <Footer />
      </div>
    );
  }

  console.log("📋 Rendering booking confirmation form");
  return (
    <div>
      <NavBar />
      <Container>
        <h1>Confirm Your Booking</h1>
        <PackageDetails>
          <h2>Booking Details</h2>
          <p><strong>Package:</strong> {state.packageDetails.title}</p>
          <p><strong>Destination:</strong> {state.packageDetails.destination}</p>
          <p><strong>Duration:</strong> {state.packageDetails.duration}</p>
          <p><strong>Price:</strong> ₹{state.packageDetails.price}</p>
          <p><strong>Additional Charges:</strong> ₹{additionalCharges} (Service & Tax)</p>
          <p className="total-price"><strong>Total Price:</strong> ₹{totalPrice}</p>
        </PackageDetails>

        <Form onSubmit={handlePayNow}>
          <label>
            Name:
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </label>
          <label>
            Email:
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </label>
          <label>
            Booking Date:
            <input
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </label>

          <Terms>
            <input type="checkbox" onChange={handleCheckboxChange} />
            I agree to the{" "}
            <a href="/terms" target="_blank" rel="noopener noreferrer">
              terms and conditions
            </a>{" "}
            of the booking.
          </Terms>

          <ButtonGroup>
            <button type="submit">Pay Now - ₹{totalPrice}</button>
            <button type="button" id="later" onClick={handlePayLater}>
              Pay Later
            </button>
          </ButtonGroup>
        </Form>
      </Container>
      <ToastContainer />
      <Footer />
    </div>
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
  transition: all 0.1s ease-in-out;

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

  &:hover {
    transform: translateY(-5px);
    box-shadow: 1px 1px 10px grey;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  background: white;
  padding: 20px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.17);
  border-radius: 20px;
  gap: 15px;
  margin: 20px auto 0;
  max-width: 400px;

  label {
    display: flex;
    justify-content: space-between;
    color: teal;
    gap: 10px;

    input {
      border: 0.2px solid grey;
      padding: 5px;
      border-radius: 5px;
      flex: 1;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;

  button {
    padding: 10px;
    background-color: teal;
    color: white;
    border: none;
    border-radius: 15px;
    cursor: pointer;
    font-size: 1rem;

    &:hover {
      background-color: darkcyan;
      color: yellow;
    }

    &#later {
      background: grey;
    }
  }
`;

const Terms = styled.div`
  font-size: 0.9rem;
  color: #555;
  display: flex;
  align-items: center;
  gap: 8px;

  a {
    color: teal;
    text-decoration: underline;

    &:hover {
      color: darkcyan;
    }
  }
`;

const PaymentFormContainer = styled.div`
  background: white;
  padding: 20px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.17);
  border-radius: 20px;
  margin: 20px auto 0;
  max-width: 400px;

  h3 {
    color: teal;
    margin-bottom: 20px;
    text-align: center;
  }
`;

const CardElementContainer = styled.div`
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 20px;
  background: #f9f9f9;
`;

const PaymentButton = styled.button`
  padding: 12px;
  background-color: teal;
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-size: 1rem;
  width: 100%;

  &:hover:not(:disabled) {
    background-color: darkcyan;
    color: yellow;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  &::after {
    content: '';
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const BackButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  background: transparent;
  border: 2px solid teal;
  color: teal;
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    background: teal;
    color: white;
  }
`;