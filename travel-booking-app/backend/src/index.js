// index.js.
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
const Razorpay = require("razorpay");
require('dotenv').config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json()); // Required for REST endpoints

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log(err));

// ✅ JWT user helper
const getUser = (token) => {
  if (!token) return null;
  try {
    const cleanToken = token.replace('Bearer ', '');
    return jwt.verify(cleanToken, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

// ✅ Apollo Server
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

// ✅ Razorpay instance and route
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

app.post('/api/payment/orders', async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error('Razorpay order error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// ✅ Start server
const startServer = async () => {
  await server.start();
  server.applyMiddleware({ app, path: '/api' });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`GraphQL API ready at http://localhost:${PORT}/api`);
    console.log(`REST API ready at http://localhost:${PORT}/api/payment/orders`);
  });
};

startServer();
