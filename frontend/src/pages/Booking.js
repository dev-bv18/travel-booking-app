import React from "react";
import BookingHeader from "../components/BookingHeader";
import BookingFooter from "../components/Footer"
import Footer from "./Footer";
import BookingContent from "../components/BookingContent";
const Booking = () => {
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
