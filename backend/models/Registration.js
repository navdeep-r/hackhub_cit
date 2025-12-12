import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  email: { type: String, required: true },
  studentId: { type: String }, // Added studentId
  hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon' },
  registeredAt: { type: Date, default: Date.now },
  department: { type: String }, // Added department field
  section: { type: String } // Added section field
});

export default mongoose.model('Registration', registrationSchema);