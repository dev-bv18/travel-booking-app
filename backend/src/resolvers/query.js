module.exports=
{
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
    };