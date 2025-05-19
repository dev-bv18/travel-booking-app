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
        if (!user) throw new Error('You must be signed in');
        if (user.id !== userId && user.role !== 'admin') throw new Error('Not authorized');
      
        const bookings = await models.Booking.find({ user: userId })
          .populate('user')
          .populate('package');
      
        return bookings.filter(b => b.package != null);
      }
      
    };