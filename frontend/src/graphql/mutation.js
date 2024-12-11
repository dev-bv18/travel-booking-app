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
    }
  }
`;

export const BOOK_PACKAGE = gql`
  mutation BookPackage($packageId: ID!, $userId: ID!, $date: String!) {
    bookPackage(packageId: $packageId, userId: $userId, date: $date) {
      id
      package {
        title
        destination
      }
      date
      status
    }
  }
`;

