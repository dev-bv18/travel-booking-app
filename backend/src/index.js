const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const cors = require('cors');
const depthLimit = require('graphql-depth-limit');
const { createComplexityLimitRule } = require('graphql-validation-complexity');
const models = require('./models');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
require('dotenv').config();

const app = express();
app.use(helmet());
app.use(cors());
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
      const cleanToken = token.replace('Bearer ', '');
      return jwt.verify(cleanToken, process.env.JWT_SECRET);
    } catch (err) {
      console.error('JWT verification error:', err);
      throw new Error('Invalid or expired session');
    }
  }
  return null; 
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
    try {
      const token = req.headers.authorization;
      const user = getUser(token);
      return { models, user };
    } catch (err) {
      console.error('Context creation error:', err.message);
      return { models, user: null };
    }
  }
  
});

const transportRoutes = require('./routes/transport');
app.use('/api/transport', transportRoutes);

const startServer = async () => {
  await server.start();  
  server.applyMiddleware({ app, path: '/api' }); 

  app.listen({ port: 4000 }, () => {
    console.log(`GraphQL Server running at http://localhost:4000/api`);
  });
};

startServer();
