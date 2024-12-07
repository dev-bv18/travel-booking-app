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

        return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    },

    // Book a travel package (auth required)
    bookPackage: async (parent, { packageId, date }, { models, user }) => {
        if (!user) {
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
            package: packageId,
            user: user.id,
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
};
