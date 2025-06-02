const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = {
  // Existing queries
  getPackages: async (_, args, { models }) => {
    try {
      const packages = await models.TravelPackage.find();
      return packages;
    } catch (err) {
      console.error('Error fetching travel packages:', err);
      throw new Error('Unable to fetch travel packages');
    }
  },

  getUsersWithBookingCounts: async (_, __, { models }) => {
    const users = await models.User.find().populate('bookings');
    return users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      bookingCount: user.bookings.length,
    }));
  },

  getUsersByPackage: async (_, { packageId }, { models }) => {
    const bookings = await models.Booking.find({ package: packageId }).populate('user');
    const uniqueUsersMap = new Map();
    bookings.forEach(booking => {
      uniqueUsersMap.set(booking.user.id, booking.user);
    });
    return Array.from(uniqueUsersMap.values());
  },

  // Fetch booking history for a specific user
  getBookingHistory: async (_, { userId }, { models, user }) => {
    if (!user) {
      throw new Error('You must be signed in to view booking history');
    }
    
    if (user.id !== userId && user.role !== 'admin') {
      throw new Error('You are not authorized to view this booking history');
    }
    
    try {
      const bookings = await models.Booking.find({ user: userId })
        .populate('user')
        .populate('package')
        .then(bookings => bookings.filter(booking => booking.package != null));
      return bookings;
    } catch (err) {
      console.error('Error fetching booking history:', err);
      throw new Error('Unable to fetch booking history');
    }
  },

  // New payment-related queries
  getPaymentStatus: async (_, { paymentIntentId }) => {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, 
        currency: paymentIntent.currency,
        paymentMethod: paymentIntent.payment_method_types[0],
        createdAt: new Date(paymentIntent.created * 1000).toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to retrieve payment status: ${error.message}`);
    }
  },

  // Get bookings by status (useful for admin)
  getBookingsByStatus: async (_, { status }, { models, user }) => {
    // Optional: Add admin check if needed
    if (user && user.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can view bookings by status');
    }

    try {
      const bookings = await models.Booking.find({ status })
        .populate('user')
        .populate('package')
        .sort({ createdAt: -1 });
      
      return bookings;
    } catch (error) {
      throw new Error(`Failed to fetch bookings: ${error.message}`);
    }
  },

  // Get specific booking by ID
  getBookingById: async (_, { bookingId }, { models, user }) => {
    try {
      const booking = await models.Booking.findById(bookingId)
        .populate('user')
        .populate('package');

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Check if user is authorized to view this booking
      if (user && user.role !== 'admin' && booking.user.id !== user.id) {
        throw new Error('You are not authorized to view this booking');
      }

      return booking;
    } catch (error) {
      throw new Error(`Failed to fetch booking: ${error.message}`);
    }
  },

  // Get all bookings for admin dashboard
  getAllBookings: async (_, __, { models, user }) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can view all bookings');
    }

    try {
      const bookings = await models.Booking.find()
        .populate('user')
        .populate('package')
        .sort({ createdAt: -1 });
      
      return bookings;
    } catch (error) {
      throw new Error(`Failed to fetch all bookings: ${error.message}`);
    }
  },

  // Get payment analytics (for admin)
  getPaymentAnalytics: async (_, { startDate, endDate }, { models, user }) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can view payment analytics');
    }

    try {
      const dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);

      const bookings = await models.Booking.find({
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        paymentStatus: 'succeeded'
      }).populate('package');

      const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
      const totalBookings = bookings.length;
      const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      // Group by package
      const packageStats = {};
      bookings.forEach(booking => {
        if (booking.package) {
          const packageId = booking.package.id;
          if (!packageStats[packageId]) {
            packageStats[packageId] = {
              packageTitle: booking.package.title,
              bookings: 0,
              revenue: 0
            };
          }
          packageStats[packageId].bookings += 1;
          packageStats[packageId].revenue += booking.totalAmount || 0;
        }
      });

      return {
        totalRevenue,
        totalBookings,
        averageBookingValue,
        packageStats: Object.values(packageStats)
      };
    } catch (error) {
      throw new Error(`Failed to fetch payment analytics: ${error.message}`);
    }
  }
};