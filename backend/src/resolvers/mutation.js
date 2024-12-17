const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-express');

module.exports = {
    // Register User and Generate JWT
    registerUser: async (parent, { username, email, password, role }, { models }) => {
        email = email.trim().toLowerCase();
        const hashed = await bcrypt.hash(password, 10);
        try {
            const user = await models.User.create({
                username,
                email,
                password: hashed,
                role: role || 'user'
            });
            return user;
        } catch (err) {
            console.error(err);
            throw new Error('Error creating account');
        }
    },

    // Login User and Generate JWT
    loginUser: async (parent, { email, password }, { models }) => {
        email = email.trim().toLowerCase();

        const user = await models.User.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new AuthenticationError('Error Signing in');
        }

        return jwt.sign({ id: user._id, role: user.role, email: user.email,username:user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    },

    // Book a travel package (auth required)
    bookPackage: async (parent, { packageId, userId, date }, { models, user }) => {
        const finalUserId = userId || user.id;          
       const User=await models.User.findById(userId);
       console.log(User);
        if (!finalUserId) {
          throw new AuthenticationError('You must be signed in to book a package');
        }
      
        const travelPackage = await models.TravelPackage.findById(packageId);
        if (!travelPackage) {
          throw new Error('Travel package not found');
        }
      
        if (travelPackage.availability <= 0) {
          throw new Error('No availability for this package');
        }
      
        const booking = await models.Booking.create({
          package: travelPackage,
          user: User,
          date,
          status: 'Confirmed',
        });
      
        travelPackage.availability -= 1;
        await travelPackage.save();
      
        return booking.populate('package');
      },
      

    // Admin-only mutation to add a new travel package
    addTravelPackage: async (_, { title, description, price, duration, destination, availability }, { models, user }) => {
        if (user.role !== 'admin') {
            throw new Error('Unauthorized: Only admins can add travel packages');
        }

        const newPackage = new models.TravelPackage({
            title,
            description,
            price,
            duration,
            destination,
            availability,
        });

        await newPackage.save();
        return newPackage;
    },
    updateTravelPackage: async (_, { id, title, description, price, duration, destination, availability }, { models, user }) => {
        // Ensure only an admin can update the package
        if (!user || user.role !== 'admin') {
          throw new Error('Unauthorized: Only admins can update travel packages');
        }
  
        try {
          // Find the package by ID and update fields
          const updatedPackage = await models.TravelPackage.findByIdAndUpdate(
            id,
            {
              title,
              description,
              price,
              duration,
              destination,
              availability,
            },
            { new: true } // Return the updated document
          );
  
          if (!updatedPackage) {
            throw new Error('Travel package not found');
          }
  
          return updatedPackage;
        } catch (err) {
          console.error('Error updating package:', err);
          throw new Error('Failed to update travel package');
        }
      },
};
