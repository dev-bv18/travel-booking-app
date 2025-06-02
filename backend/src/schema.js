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
        paymentId: String
        paymentStatus: String
        paymentMethod: String
        totalAmount: Float
        createdAt: String
        updatedAt: String
    }

    type PaymentIntent {
        clientSecret: String!
        paymentIntentId: String!
        amount: Float!
        currency: String!
    }

    type PaymentStatus {
    paymentIntentId: String!
    status: String!
    amount: Float!
    currency: String!
    paymentMethod: String
    createdAt: String
}

type PackageStats {
    packageTitle: String!
    bookings: Int!
    revenue: Float!
}

type PaymentAnalytics {
    totalRevenue: Float!
    totalBookings: Int!
    averageBookingValue: Float!
    packageStats: [PackageStats!]!
}

    type Query {
        getPackages: [TravelPackage!]
        getUsersByPackage(packageId: ID!): [User!]
        getUsersWithBookingCounts: [UserWithBookingCount!]
        getBookingHistory(userId: ID!): [Booking!]
        getPaymentStatus(paymentIntentId: String!): PaymentStatus
        getBookingsByStatus(status: String!): [Booking!]
        getBookingById(bookingId: ID!): Booking
        getAllBookings: [Booking!] 
        getPaymentAnalytics(startDate: String, endDate: String): PaymentAnalytics
    }

    type Mutation {
        updateBookingStatus(bookingId: ID!, status: String!): Booking
        registerUser(username: String!, email: String!, password: String!, role: String): User
        loginUser(email: String!, password: String!): String
        
        bookPackage(
            packageId: ID!, 
            userId: ID!, 
            date: String!, 
            status: String!,
            paymentId: String,
            paymentStatus: String,
            paymentMethod: String,
            totalAmount: Float
        ): Booking
        
        createPaymentIntent(
            packageId: ID!,
            userId: ID!,
            amount: Float!,
            currency: String!
        ): PaymentIntent
        
        confirmPayment(
            bookingId: ID!,
            paymentIntentId: String!,
            paymentStatus: String!
        ): Booking
        
        processRefund(
            bookingId: ID!,
            amount: Float,
            reason: String
        ): Booking
        
        deleteTravelPackage(id: ID!): TravelPackage
        addTravelPackage(
            title: String!, 
            description: String!, 
            price: Float!, 
            duration: String!, 
            destination: String!, 
            availability: Int!
        ): TravelPackage
        
        updateTravelPackage(
            id: ID!
            title: String!
            description: String!
            price: Float!
            duration: String!
            destination: String!
            availability: Int!
        ): TravelPackage

        cancelBooking(bookingId: ID!): Booking
    }
`;