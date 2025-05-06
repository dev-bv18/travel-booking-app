import { gql } from '@apollo/client';

export const SIGN_UP = gql`
  mutation RegisterUser($username: String!, $email: String!, $password: String!, $role: String) {
    registerUser(username: $username, email: $email, password: $password, role: $role) {
      id
      username
      email
      role
    }
  }
`;

// Login User Mutation
export const LOGIN = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password)
  }
`;

export const ADD_TRAVEL_PACKAGE = gql`
  mutation ($title: String!, $description: String!, $price: Float!, $duration: String!, $destination: String!, $availability: Int!) {
    addTravelPackage(title: $title, description: $description, price: $price, duration: $duration, destination: $destination, availability: $availability) {
      id
      title
      destination
      description
      price
      duration
      availability
    }
  }
`;
export const UPDATE_PACKAGE = gql`
  mutation UpdateTravelPackage(
    $id: ID!
    $title: String!
    $description: String!
    $price: Float!
    $duration: String!
    $destination: String!
    $availability: Int!
  ) {
    updateTravelPackage(
      id: $id
      title: $title
      description: $description
      price: $price
      duration: $duration
      destination: $destination
      availability: $availability
    ) {
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

export const DELETE_PACKAGE = gql`
  mutation DeleteTravelPackage($id:ID!) {
    deleteTravelPackage(id: $id){
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
export const BOOK_PACKAGE = gql`
  mutation BookPackage($packageId: ID!, $userId: ID!, $date: String!,$status:String!) {
    bookPackage(packageId: $packageId, userId: $userId, date: $date,status:$status) {
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
export const UPDATE_BOOKING_STATUS = gql`
  mutation UpdateBookingStatus($bookingId: ID!, $status: String!) {
    updateBookingStatus(bookingId: $bookingId, status: $status) {
      id
      status
      package {
      id
      title
      description
      price
      duration
      destination
      availability
      }
      date
    }
  }
`;
const ADD_RATING_AND_REVIEW = gql`
  mutation AddRatingAndReview($bookingId: ID!, $rating: Int!, $review: String!) {
    addRatingAndReview(bookingId: $bookingId, rating: $rating, review: $review) {
      id
      rating
      review
    }
  }
`;


