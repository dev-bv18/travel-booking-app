const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-express');

module.exports = {
  registerUser: async (parent, { username, email, password, role }, { models }) => {
    email = email.trim().toLowerCase();
    const hashed = await bcrypt.hash(password, 10);
    try {
      const existingEmail = await models.User.findOne({ email });
      if (existingEmail) throw new Error('A user with this email already exists.');

      const existingUsername = await models.User.findOne({ username });
      if (existingUsername) throw new Error('A user with this username already exists.');

      const user = await models.User.create({
        username,
        email,
        password: hashed,
        role: role || 'user'
      });
      return user;
    } catch (err) {
      console.error(err);
      throw new Error(err.message || 'Error creating account');
    }
  },

  loginUser: async (parent, { email, password }, { models }) => {
    email = email.trim().toLowerCase();
    const user = await models.User.findOne({ email });
    if (!user) throw new Error('User not found');

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) throw new AuthenticationError('Error Signing in');

    // Set token to 7 days (can be adjusted)
    return jwt.sign({
      id: user._id,
      role: user.role,
      email: user.email,
      username: user.username
    }, process.env.JWT_SECRET, { expiresIn: '7d' });
  },

  // Other mutations remain unchanged
  bookPackage: async (parent, { packageId, userId, date, status }, { models, user }) => {
    const finalUserId = userId || user.id;
    const User = await models.User.findById(finalUserId);

    if (!finalUserId) throw new AuthenticationError('You must be signed in to book a package');

    const travelPackage = await models.TravelPackage.findById(packageId);
    if (!travelPackage) throw new Error('Travel package not found');
    if (travelPackage.availability <= 0) throw new Error('No availability for this package');

    const booking = await models.Booking.create({
      package: travelPackage,
      user: User,
      date,
      status: status || 'Confirmed'
    });

    travelPackage.availability -= 1;
    await travelPackage.save();
    User.bookings.push(booking);
    await User.save();

    return booking.populate('package');
  },

  updateBookingStatus: async (_, { bookingId, status }, { models }) => {
    const booking = await models.Booking.findById(bookingId);
    if (!booking) throw new Error('Booking not found');

    booking.status = status;
    await booking.save();
    await booking.populate('package');

    return booking;
  },

  addTravelPackage: async (_, { title, description, price, duration, destination, availability }, { models, user }) => {
    if (user.role !== 'admin') throw new Error('Unauthorized: Only admins can add travel packages');

    const newPackage = new models.TravelPackage({
      title,
      description,
      price,
      duration,
      destination,
      availability
    });

    await newPackage.save();
    return newPackage;
  },

  deleteTravelPackage: async (_, { id }, { models, user }) => {
    if (!user || user.role !== 'admin') throw new Error('Unauthorized: Only admins can delete travel packages');

    const deletePackage = await models.TravelPackage.findByIdAndDelete(id);
    if (!deletePackage) throw new Error('Travel package not found or already deleted');

    return deletePackage;
  },

  updateTravelPackage: async (_, { id, title, description, price, duration, destination, availability }, { models, user }) => {
    if (!user || user.role !== 'admin') throw new Error('Unauthorized: Only admins can update travel packages');

    const updatedPackage = await models.TravelPackage.findByIdAndUpdate(
      id,
      { title, description, price, duration, destination, availability },
      { new: true }
    );

    if (!updatedPackage) throw new Error('Travel package not found');

    return updatedPackage;
  },
  addRatingAndReview: async (_, { bookingId, rating, review }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to rate and review a booking');
    }

    const booking = await models.Booking.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.user.toString() !== user.id) {
      throw new Error('You can only rate and review your own bookings');
    }

    // Update the booking with the rating and review
    booking.rating = rating;
    booking.review = review;
    await booking.save();

    return booking;
  },
  
};