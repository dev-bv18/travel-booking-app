import React, { useEffect } from "react";
import BookingHeader from "../components/BookingHeader";
import BookingFooter from "../components/Footer"
import Footer from "./Footer";
import BookingContent from "../components/BookingContent";

const Booking = () => {
    useEffect(() => {
    window.scrollTo(0, 0); 
  }, []);
  return (
    <div>
      <BookingHeader />
      <BookingContent />
      <BookingFooter />
      <Footer/>
    </div>
  );
};

export default Booking;
