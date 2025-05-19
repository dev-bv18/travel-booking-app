const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'TravelPackage', required: true },
    date: { type: String, required: true },
    status: { type: String, default: 'Pending' }, // 'Pending' or 'Confirmed'
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String }, 
});

module.exports = mongoose.model('Booking', BookingSchema);