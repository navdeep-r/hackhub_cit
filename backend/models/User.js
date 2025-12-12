import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['STUDENT', 'FACULTY'], default: 'STUDENT' },
  department: String,
  year: String,
  registerNo: String,
  section: String, // Added section field for students
  profilePicture: String, // Base64 string
  bio: String,
  skills: [String],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);