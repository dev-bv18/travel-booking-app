import React from "react";
import BookingHeader from "../components/BookingHeader";
import BookingFooter from "../components/Footer"
import BookingHistory from "./BookingHistory";
import BookingContent from "../components/BookingContent";
const Booking = () => {
  return (
    <div>
      <BookingHeader />
      <BookingContent />
      <BookingFooter />
    </div>
  );
};

export default Booking;
