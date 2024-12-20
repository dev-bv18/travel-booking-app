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
