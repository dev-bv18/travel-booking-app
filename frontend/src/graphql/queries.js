import { gql } from '@apollo/client';

export const GET_PACKAGES = gql`
  query{
    getPackages {
      id
      title
      description
      price
      duration
      destination
      availability
    }
  }
`;
export const GET_USERS_WITH_BOOKING_COUNTS = gql`
  query GetUsersWithBookingCounts {
    getUsersWithBookingCounts {
      id
      username
      email
      bookingCount
    }
  }
`;
export const GET_BOOKING_HISTORY = gql`
  query ($userId: ID!) {
    getBookingHistory(userId: $userId) {
      id
      package {
        title
      description
      price
      duration
      destination
      availability
      }
      date
      status
    }
  }
`;
