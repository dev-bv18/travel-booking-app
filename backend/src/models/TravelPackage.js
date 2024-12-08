const mongoose = require('mongoose');

const TravelPackageSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: String, required: true },
    destination: { type: String, required: true },
    availability: { type: Number, required: true },
});

module.exports = mongoose.model('TravelPackage', TravelPackageSchema);
