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
  mutation AddTravelPackage(
    $title: String!
    $description: String!
    $price: Float!
    $duration: String!
    $destination: String!
    $availability: Int!
  ) {
    addTravelPackage(
      title: $title
      description: $description
      price: $price
      duration: $duration
      destination: $destination
      availability: $availability
    ) {
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
  mutation DeleteTravelPackage($id: ID!) {
    deleteTravelPackage(id: $id) {
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
  mutation BookPackage(
    $packageId: ID!
    $userId: ID
    $date: String!
    $status: String
    $paymentId: String
    $paymentStatus: String
    $paymentMethod: String
    $totalAmount: Float
  ) {
    bookPackage(
      packageId: $packageId
      userId: $userId
      date: $date
      status: $status
      paymentId: $paymentId
      paymentStatus: $paymentStatus
      paymentMethod: $paymentMethod
      totalAmount: $totalAmount
    ) {
      id
      date
      status
      paymentId
      paymentStatus
      paymentMethod
      totalAmount
       createdAt
      updatedAt
      user {
        id
        username
        email
      }
      package {
        id
        title
        description
        price
        duration
        destination
        availability
      }
    }
  }
`;

export const CREATE_PAYMENT_INTENT = gql`
  mutation CreatePaymentIntent(
    $packageId: ID!
    $userId: ID!
    $amount: Float!
    $currency: String!
  ) {
    createPaymentIntent(
      packageId: $packageId
      userId: $userId
      amount: $amount
      currency: $currency
    ) {
      clientSecret
      paymentIntentId
      amount
      currency
    }
  }
`;

// Confirm payment mutation
export const CONFIRM_PAYMENT = gql`
  mutation ConfirmPayment($bookingId: ID!, $paymentIntentId: String!) {
    confirmPayment(bookingId: $bookingId, paymentIntentId: $paymentIntentId) {
      id
      date
      status
      paymentId
      paymentMethod
      totalAmount
      user {
        id
        username
        email
      }
      package {
        id
        title
        destination
        duration
        price
      }
    }
  }
`;

// Process refund mutation (for admin use)
export const PROCESS_REFUND = gql`
  mutation ProcessRefund($bookingId: ID!, $amount: Float, $reason: String) {
    processRefund(bookingId: $bookingId, amount: $amount, reason: $reason) {
      id
      status
      paymentStatus
      totalAmount
      user {
        id
        username
        email
      }
      package {
        id
        title
        destination
      }
    }
  }
`;

// Cancel booking with optional refund
export const CANCEL_BOOKING = gql`
  mutation CancelBooking($bookingId: ID!, $processRefund: Boolean) {
    cancelBooking(bookingId: $bookingId, processRefund: $processRefund) {
      id
      status
      paymentStatus
      paymentId
      totalAmount
      user {
        id
        username
        email
      }
      package {
        id
        title
        destination
      }
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

// Helper function to validate CREATE_PAYMENT_INTENT variables
export const validatePaymentIntentVariables = (variables) => {
  const errors = [];
  
  if (!variables.packageId) {
    errors.push('packageId is required');
  }
  
  if (!variables.userId) {
    errors.push('userId is required');
  }
  
  if (!variables.amount || typeof variables.amount !== 'number' || variables.amount <= 0) {
    errors.push('amount must be a positive number');
  }
  
  if (!variables.currency || typeof variables.currency !== 'string') {
    errors.push('currency must be a non-empty string');
  }
  
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }
  
  return true;
};

// Enhanced error handler for debugging
export const handleGraphQLError = (error, operationName = 'GraphQL Operation') => {
  console.error(`❌ ${operationName} Error:`, error);
  
  // Log GraphQL-specific errors
  if (error.graphQLErrors && error.graphQLErrors.length > 0) {
    console.error('🔍 GraphQL Errors:');
    error.graphQLErrors.forEach((gqlError, index) => {
      console.error(`  ${index + 1}. ${gqlError.message}`);
      if (gqlError.extensions) {
        console.error('     Extensions:', gqlError.extensions);
      }
      if (gqlError.locations) {
        console.error('     Locations:', gqlError.locations);
      }
      if (gqlError.path) {
        console.error('     Path:', gqlError.path);
      }
    });
  }
  
  // Log network errors
  if (error.networkError) {
    console.error('🌐 Network Error:', error.networkError);
    if (error.networkError.result) {
      console.error('     Server Response:', error.networkError.result);
    }
  }
  
  return error;
};