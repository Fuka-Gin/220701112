const mongoose = require('mongoose');

const linkData = new mongoose.Schema({
    url: String,
    validity: { type: Number, default: 30 },
    shortcode: String,
    expiry: Date,
    creationDate: { type: Date, default: Date.now },
    numberOfClicks: { type: Number, default: 0 },
    shortcode: String,
    clickTime: { type: Date, default: Date.now },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: { type: [Number], default: [0, 0] }
    }
});

module.exports = mongoose.model('Url', linkData);