const mongoose = require('mongoose');

const hackathonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: String,
  registrationDeadline: String,
  registrationLink: String,
  platform: String,
  location: String,
  prizePool: String,
  categories: [String],
  tags: [String],
  impressions: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Hackathon', hackathonSchema);