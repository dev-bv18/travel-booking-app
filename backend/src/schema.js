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

type UserWithBookingCount {
    id: ID!
    username: String!
    email: String!
    bookingCount: Int!
}

    type Booking {
        id: ID!
        user: User!
        package: TravelPackage!
        date: String!
        status: String!
    }

    type Query {
        getPackages:[TravelPackage!]
        getUsersByPackage(packageId: ID!): [User!]
        getUsersWithBookingCounts: [UserWithBookingCount!]
        getBookingHistory(userId: ID!): [Booking!]
    }

    type Mutation {
        updateBookingStatus(bookingId: ID!, status: String!): Booking
        registerUser(username: String!, email: String!, password: String!, role: String): User
        loginUser(email: String!, password: String!): String
        bookPackage(packageId: ID!, userId: ID!, date: String!,status:String!): Booking
        deleteTravelPackage(id:ID!):TravelPackage
        addTravelPackage(title: String!, description: String!, price: Float!, duration: String!, destination: String!, availability: Int!): TravelPackage
         updateTravelPackage(
      id: ID!
      title: String!
      description: String!
      price: Float!
      duration: String!
      destination: String!
      availability: Int!
    ): TravelPackage
    }
`;
