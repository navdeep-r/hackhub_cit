const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  email: { type: String, required: true },
  hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon' },
  status: { type: String, default: 'pending' },
  registeredAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Registration', registrationSchema);