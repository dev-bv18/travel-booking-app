const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const cors = require('cors');
const depthLimit = require('graphql-depth-limit');
const { createComplexityLimitRule } = require('graphql-validation-complexity');
const { authenticate } = require('./utils/auth');
const models = require('./models');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
require('dotenv').config();

const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log(err));

// Helper function to get the user from the JWT token
const getUser = (token) => {
  if (token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error('Session expired');
    }
  }
};

// Apollo Server setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [
    depthLimit(5),
    createComplexityLimitRule(1000)
  ],
  context: ({ req }) => {
    const token = req.headers.authorization;
    const user = getUser(token);
    return { models, user };
  }
});

// Start the server asynchronously
const startServer = async () => {
  await server.start();  // Await server start
  server.applyMiddleware({ app, path: '/api' }); // Apply middleware after the server starts

  app.listen({ port: 4000 }, () => {
    console.log(`GraphQL Server running at http://localhost:4000/api`);
  });
};

// Run the server
startServer();
