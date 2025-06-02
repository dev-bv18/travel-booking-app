const Booking = require('./Booking');
const User = require('./User');
const TravelPackage=require('./TravelPackage');
require('dotenv').config();

const models = {
  Booking,
  User,
  TravelPackage
};

module.exports = models;
