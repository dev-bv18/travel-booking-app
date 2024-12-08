const { gql } = require('apollo-server-express');

module.exports = gql`
    type TravelPackage {
        id: ID!
        title: String!
        description: String!
        price: Float!
        duration: String!
        destination: String!
        availability: Int
    }

    type User {
        id: ID!
        username: String!
        email: String!
        role: String!
        password: String!
        bookings: [Booking]
    }

    type Booking {
        id: ID!
        user: User!
        package: TravelPackage!
        date: String!
        status: String!
    }

    type Query {
        getPackages: [TravelPackage!]
        getBookingHistory(userId: ID!): [Booking!]
    }

    type Mutation {
        registerUser(username: String!, email: String!, password: String!, role: String): User
        loginUser(email: String!, password: String!): String
        bookPackage(packageId: ID!, userId: ID!, date: String!): Booking
        addTravelPackage(title: String!, description: String!, price: Float!, duration: String!, destination: String!, availability: Int!): TravelPackage
    }
`;
