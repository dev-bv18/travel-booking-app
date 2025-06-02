const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'TravelPackage', required: true },
    date: { type: String, required: true },
    status: { type: String, default: 'Pending' },
    paymentId: { type: String },
    paymentStatus: { type: String },
    paymentMethod: { type: String },
    totalAmount: { type: Number },
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

module.exports = mongoose.model('Booking', BookingSchema);
