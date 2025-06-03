const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { AuthenticationError, UserInputError } = require('apollo-server-express');

module.exports = {
  // Existing authentication mutations
  registerUser: async (parent, { username, email, password, role }, { models }) => {
    email = email.trim().toLowerCase();
    const hashed = await bcrypt.hash(password, 10);
    try {
      const existingEmail = await models.User.findOne({ email });
      if (existingEmail) {
        throw new Error('A user with this email already exists.');
      }
      const existingUsername = await models.User.findOne({ username });
      if (existingUsername) {
        throw new Error('A user with this username already exists.');
      }

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
    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AuthenticationError('Error Signing in');
    }

    return jwt.sign({ id: user._id, role: user.role, email: user.email, username: user.username }, process.env.JWT_SECRET, { expiresIn: '2h' });
  },

  // Fixed booking mutation with better error handling and validation
  bookPackage: async (parent, args, { models, user }) => {
    console.log('📝 bookPackage called with args:', args);
    console.log('👤 User context:', user);

    const {
      packageId,
      userId,
      date,
      status,
      paymentId,
      paymentStatus,
      paymentMethod,
      totalAmount
    } = args;

    // Determine final user ID - prioritize userId from args, then user from context
    const finalUserId = userId || (user ? user.id : null);
    
    console.log('🔍 Final user ID determined:', finalUserId);

    if (!finalUserId) {
      throw new AuthenticationError('You must be signed in to book a package');
    }

    // Validate required fields
    if (!packageId) {
      throw new UserInputError('Package ID is required');
    }

    if (!date) {
      throw new UserInputError('Booking date is required');
    }

    try {
      // Find user
      const userDoc = await models.User.findById(finalUserId);
      if (!userDoc) {
        throw new UserInputError('User not found');
      }
      console.log('✅ User found:', userDoc.username);

      // Find package
      const travelPackage = await models.TravelPackage.findById(packageId);
      if (!travelPackage) {
        throw new UserInputError('Travel package not found');
      }
      console.log('✅ Package found:', travelPackage.title);

      // Check availability for confirmed bookings
      const bookingStatus = status || 'Pending';
      if (travelPackage.availability <= 0 && bookingStatus === 'Confirmed') {
        throw new UserInputError('No availability for this package');
      }

      console.log('📋 Creating booking with data:', {
        package: travelPackage._id,
        user: userDoc._id,
        date,
        status: bookingStatus,
        paymentId: paymentId || null,
        paymentStatus: paymentStatus || 'pending',
        paymentMethod: paymentMethod || null,
        totalAmount: totalAmount || travelPackage.price,
      });

      // Create booking
      const booking = await models.Booking.create({
        package: travelPackage._id,
        user: userDoc._id,
        date,
        status: bookingStatus,
        paymentId: paymentId || null,
        paymentStatus: paymentStatus || 'pending',
        paymentMethod: paymentMethod || null,
        totalAmount: totalAmount || travelPackage.price,
      });

      console.log('✅ Booking created with ID:', booking._id);

      // Only reduce availability if booking is confirmed
      if (booking.status === 'Confirmed') {
        travelPackage.availability -= 1;
        await travelPackage.save();
        console.log('📦 Package availability reduced to:', travelPackage.availability);
      }

      // Add booking to user's bookings array if it exists
      if (userDoc.bookings) {
        userDoc.bookings.push(booking._id);
        await userDoc.save();
        console.log('👤 Booking added to user bookings array');
      }

      // Populate and return the booking
      await booking.populate('package');
      await booking.populate('user');
      
      console.log('✅ Booking successfully created and populated');
      return booking;
    } catch (error) {
      console.error('❌ Error in bookPackage:', error);
      console.error('Error stack:', error.stack);
      throw new Error(`Failed to create booking: ${error.message}`);
    }
  },

  // Create payment intent with Stripe
  createPaymentIntent: async (_, { packageId, userId, amount, currency }, { models, user }) => {
    console.log('💳 createPaymentIntent called with:', { packageId, userId, amount, currency });
    console.log('👤 User context:', user);

    try {
      // Determine user ID
      const finalUserId = userId || (user ? user.id : null);
      
      if (!finalUserId) {
        throw new AuthenticationError('You must be signed in to create a payment intent');
      }

      // Validate package
      if (!packageId) {
        throw new UserInputError('Package ID is required');
      }

      // Verify package exists and get details
      const travelPackage = await models.TravelPackage.findById(packageId);
      if (!travelPackage) {
        throw new UserInputError('Package not found');
      }
      console.log('✅ Package found for payment:', travelPackage.title);

      // Verify user exists
      const userDoc = await models.User.findById(finalUserId);
      if (!userDoc) {
        throw new UserInputError('User not found');
      }
      console.log('✅ User found for payment:', userDoc.username);

      // Use package price if amount not provided
      const finalAmount = amount || travelPackage.price;
      const finalCurrency = currency || 'inr';

      console.log('💰 Payment intent details:', {
        amount: finalAmount,
        currency: finalCurrency,
        packageTitle: travelPackage.title,
        userEmail: userDoc.email
      });

      // Create payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(finalAmount * 100), // Convert to smallest currency unit
        currency: finalCurrency,
        metadata: {
          packageId,
          userId: finalUserId,
          packageTitle: travelPackage.title,
          userEmail: userDoc.email,
        },
        receipt_email: userDoc.email,
        description: `Travel package booking - ${travelPackage.title}`,
      });

      console.log('✅ Stripe payment intent created:', paymentIntent.id);

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: finalAmount,
        currency: paymentIntent.currency,
      };
    } catch (error) {
      console.error('❌ Error in createPaymentIntent:', error);
      console.error('Error stack:', error.stack);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  },

  // Confirm payment after successful Stripe payment
  confirmPayment: async (_, { bookingId, paymentIntentId }, { models }) => {
    console.log("🔍 confirmPayment called with:", { bookingId, paymentIntentId });
    try {
      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        throw new Error('Payment not successful');
      }

      // Find and update booking
      const booking = await models.Booking.findById(bookingId);
      if (!booking) {
        throw new UserInputError('Booking not found');
      }

      // Update booking with payment information
      booking.status = 'Confirmed';
      booking.paymentId = paymentIntentId;
      booking.paymentStatus = paymentIntent.status;
      booking.paymentMethod = paymentIntent.payment_method_types[0];
      booking.totalAmount = paymentIntent.amount / 100;
      await booking.save();

      // Update package availability
      const travelPackage = await models.TravelPackage.findById(booking.package);
      if (travelPackage && travelPackage.availability > 0) {
        travelPackage.availability -= 1;
        await travelPackage.save();
      }

      // Populate and return updated booking
      await booking.populate('package');
      await booking.populate('user');
      
      return booking;
    } catch (error) {
      console.error('❌ Error in confirmPayment:', error);
      throw new Error(`Failed to confirm payment: ${error.message}`);
    }
  },

  // Process refund
  processRefund: async (_, { bookingId, amount, reason }, { models, user }) => {
    // Optional: Add admin check
    if (user && user.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can process refunds');
    }

    try {
      const booking = await models.Booking.findById(bookingId).populate('package');
      if (!booking) {
        throw new UserInputError('Booking not found');
      }

      if (!booking.paymentId) {
        throw new Error('No payment ID found for this booking');
      }

      // Create refund with Stripe
      const refund = await stripe.refunds.create({
        payment_intent: booking.paymentId,
        amount: amount ? Math.round(amount * 100) : undefined, // Partial or full refund
        reason: reason || 'requested_by_customer',
        metadata: {
          bookingId: bookingId,
          originalAmount: booking.totalAmount,
        },
      });

      // Update booking status
      booking.status = 'Refunded';
      booking.paymentStatus = 'refunded';
      await booking.save();

      // Restore package availability
      if (booking.package) {
        booking.package.availability += 1;
        await booking.package.save();
      }

      // Populate and return updated booking
      await booking.populate('package');
      await booking.populate('user');
      
      return booking;
    } catch (error) {
      throw new Error(`Failed to process refund: ${error.message}`);
    }
  },

  // Enhanced updateBookingStatus with payment handling
  updateBookingStatus: async (_, { bookingId, status }, { models, user }) => {
    if (!user || (user.role !== 'admin' && user.role !== 'agent')) {
      throw new AuthenticationError('You are not authorized to update bookings.');
    }

    try {
      const booking = await models.Booking.findById(bookingId).populate('package');
      if (!booking) {
        throw new UserInputError('Booking not found');
      }

      booking.status = status;

      if (status === 'Cancelled' || status === 'Refunded') {
        if (booking.package) {
          booking.package.availability += 1;
          await booking.package.save();
        }
        booking.paymentStatus = 'refunded';
      } else if (status === 'Confirmed') {
        if (booking.package && booking.package.availability > 0) {
          booking.package.availability -= 1;
          await booking.package.save();
        }
      }

      await booking.save();
      await booking.populate('user');

      return booking;
    } catch (error) {
      throw new Error(`Failed to update booking status: ${error.message}`);
    }
  },

  // Existing travel package management mutations
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

  deleteTravelPackage: async (_, { id }, { models, user }) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can delete travel packages');
    }
    try {
      const deletePackage = await models.TravelPackage.findByIdAndDelete(id);
      if (!deletePackage) {
        throw new Error('Travel package not found or already deleted');
      }

      return deletePackage;
    } catch (error) {
      console.error('Error deleting package:', error);
      throw new Error('Failed to delete package.');
    }
  },

  updateTravelPackage: async (_, { id, title, description, price, duration, destination, availability }, { models, user }) => {
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

  cancelBooking: async (_, { bookingId, processRefund }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to cancel a booking.');
    }

    try {
      const booking = await models.Booking.findById(bookingId).populate('package');
      if (!booking) {
        throw new UserInputError('Booking not found');
      }

      if (String(booking.user) !== String(user.id) && user.role !== 'admin') {
        throw new AuthenticationError('You are not authorized to cancel this booking.');
      }

      booking.status = 'Cancelled';
      booking.paymentStatus = 'refunded';

      if (booking.package) {
        booking.package.availability += 1;
        await booking.package.save();
      }

      await booking.save();

      // Optional refund processing
      let refundData = null;
      if (processRefund && booking.paymentId) {
        try {
          const refund = await stripe.refunds.create({
            payment_intent: booking.paymentId,
            metadata: {
              bookingId,
              userId: booking.user._id.toString(),
              reason: 'User requested cancellation',
            },
          });
          refundData = refund;
        } catch (refundError) {
          console.error('Refund error:', refundError);
          // Don't fail the cancellation even if refund fails
        }
      }

      await booking.populate('user');

      return {
        booking,
        refund: refundData ? refundData.id : null,
        message: 'Booking cancelled successfully',
      };
    } catch (error) {
      throw new Error(`Failed to cancel booking: ${error.message}`);
    }
  },
};