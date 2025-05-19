import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { GET_BOOKING_HISTORY } from '../graphql/queries';
import Navbar from './NavBar';
import './BookingHistory.css';
import LoadingScreen from './LoadingScreen.js';
import Empty from './Empty';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from './Footer';

const ADD_RATING_AND_REVIEW = gql`
  mutation AddRatingAndReview($bookingId: ID!, $rating: Int!, $review: String!) {
    addRatingAndReview(bookingId: $bookingId, rating: $rating, review: $review) {
      id
      rating
      review
    }
  }
`;

const BookingHistory = () => {
  const { userId } = useParams(); 
  const navigate = useNavigate();

  const [filterOption, setFilterOption] = useState('all');
  const [sortOption, setSortOption] = useState('dateDesc');
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [username, setUsername] = useState('');
  const [submittedReviews, setSubmittedReviews] = useState({});

  const [ratingStates, setRatingStates] = useState({});
  const [hoverStates, setHoverStates] = useState({});
  const [reviewStates, setReviewStates] = useState({});

  const [addRatingAndReview] = useMutation(ADD_RATING_AND_REVIEW);

  const { loading, error, data, refetch } = useQuery(GET_BOOKING_HISTORY, {
    variables: { userId },
    skip: !userId,
    onError: () => {
      refetch();
    },
  });

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    const storedUserId = localStorage.getItem('user-id');
    const storedUsername = localStorage.getItem('selected-username');

    if (!token || !storedUserId) {
      alert('Please log in to view your booking history.');
      navigate('/auth');
      return;
    }

    setUsername(storedUsername || 'User');
    setTimeout(() => setShowLoadingScreen(false), 2000);
  }, []);

  useEffect(() => {
    if (error) navigate('/auth');
  }, [error]);

  useEffect(() => {
    if (userId) refetch();
  }, [userId, refetch]);

  const handleRatingChange = (bookingId, star) => {
    setRatingStates((prev) => ({ ...prev, [bookingId]: star }));
  };

  const handleHoverChange = (bookingId, star) => {
    setHoverStates((prev) => ({ ...prev, [bookingId]: star }));
  };

  const handleReviewChange = (bookingId, text) => {
    setReviewStates((prev) => ({ ...prev, [bookingId]: text }));
  };

  const handleRatingSubmit = async (e, bookingId) => {
    e.preventDefault();
    const submittedRating = ratingStates[bookingId] || 5;
    const submittedReview = reviewStates[bookingId] || '';

    try {
      await addRatingAndReview({
        variables: {
          bookingId,
          rating: submittedRating,
          review: submittedReview,
        },
      });

      alert('Rating submitted!');

      // Clear local inputs
      setRatingStates((prev) => ({ ...prev, [bookingId]: 5 }));
      setReviewStates((prev) => ({ ...prev, [bookingId]: '' }));
      setHoverStates((prev) => ({ ...prev, [bookingId]: 0 }));

      // Refetch booking history to update the UI
      refetch();
    } catch (err) {
      console.error(err);
      alert('Failed to submit rating.');
    }
  };

  const filterBookings = (bookings) => {
    if (filterOption === 'confirmed') return bookings.filter((b) => b.status === 'Confirmed');
    if (filterOption === 'pending') return bookings.filter((b) => b.status === 'Pending');
    return bookings;
  };

  const sortBookings = (bookings) => {
    const sorted = [...bookings];
    if (sortOption === 'dateAsc') return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (sortOption === 'dateDesc') return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (sortOption === 'priceAsc') return sorted.sort((a, b) => a.package.price - b.package.price);
    if (sortOption === 'priceDesc') return sorted.sort((a, b) => b.package.price - a.package.price);
    return sorted;
  };

  const bookingHistory = data?.getBookingHistory || [];
  const filteredBookings = filterBookings(bookingHistory);
  const sortedBookings = sortBookings(filteredBookings);

  return (
    <div>
      <Navbar />
      <div className="booking-history">
        <h3>Welcome back ✈</h3>
        <h1>{username}'s Booking History</h1>

        <div className='booking-history-options'>
          <div className="filter-container">
            <label htmlFor="filter">Filter by status: </label>
            <select id="filter" onChange={(e) => setFilterOption(e.target.value)} value={filterOption}>
              <option value="all">All</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="sort-container">
            <label htmlFor="sort">Sort by: </label>
            <select id="sort" onChange={(e) => setSortOption(e.target.value)} value={sortOption}>
              <option value="dateDesc">Booking Date (Newest First)</option>
              <option value="dateAsc">Booking Date (Oldest First)</option>
              <option value="priceAsc">Price (Low to High)</option>
              <option value="priceDesc">Price (High to Low)</option>
            </select>
          </div>
        </div>

        {sortedBookings.length === 0 ? (
          <div>
            <Empty />
            <p id="message"> No bookings yet!.</p>
          </div>
        ) : (
          <ul className='bookings-list'>
            {sortedBookings.map((booking) => (
              <li key={booking.id} className="booking-card">
                {booking.package ? (
                  <>
                    <h2>{booking.package.title}</h2>
                    <p><strong>Destination:</strong> {booking.package.destination}</p>
                    <p><strong>Booking Date:</strong> {booking.date}</p>
                    <p>₹{booking.package.price}</p>
                    <p id="status">{booking.status + (booking.status === 'Confirmed' ? ' ✅' : ' ❌')}</p>

                    {booking.rating || booking.review ? (
                      <div className="review-comment-box">
                        <div className="comment-header">
                          Your Rating - {booking.rating}⭐
                        </div>
                        <div className="comment-body">
                          Your Review - {booking.review}
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={(e) => handleRatingSubmit(e, booking.id)} className="inline-rating-form">
                        <div className="star-rating" style={{ textAlign: 'center', margin: '10px 0' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              onClick={() => handleRatingChange(booking.id, star)}
                              onMouseEnter={() => handleHoverChange(booking.id, star)}
                              onMouseLeave={() => handleHoverChange(booking.id, 0)}
                              style={{
                                cursor: 'pointer',
                                color: star <= (hoverStates[booking.id] || ratingStates[booking.id] || 5) ? 'gold' : 'gray',
                                fontSize: '2.5rem',
                                transition: 'color 0.2s ease'
                              }}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <textarea
                          placeholder="Write your review here..."
                          value={reviewStates[booking.id] || ''}
                          onChange={(e) => handleReviewChange(booking.id, e.target.value)}
                          required
                          rows={3}
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                        />
                        <button type="submit" style={{ backgroundColor: '#28a745', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '6px', marginTop: '10px', cursor: 'pointer' }}>
                          Submit
                        </button>
                      </form>
                    )}
                  </>
                ) : (
                  <p>Package information is unavailable.</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BookingHistory;
