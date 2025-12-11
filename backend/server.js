require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// Import Models
const Hackathon = require('./models/Hackathon');
const Registration = require('./models/Registration');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const NODE_ENV = process.env.NODE_ENV || "developement";
const isProduction = NODE_ENV == "production";

// Log environment configuration (helpful for debugging deployment issues)
console.log('🌍 Environment Configuration:');
console.log('   PORT:', PORT);
console.log('   FRONTEND_ORIGIN:', FRONTEND_ORIGIN);
console.log('   NODE_ENV:', NODE_ENV);
console.log('   isProduction:', isProduction);

// Middleware
app.use(cookieParser());

// CORS Configuration - explicit origin handling
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if the origin is allowed
    if (origin === FRONTEND_ORIGIN) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      console.log('   Expected:', FRONTEND_ORIGIN);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// --- DATABASE CONNECTION ---
// If you have a cloud URL, put it in a .env file as MONGODB_URI
// Otherwise, this defaults to a local database named 'hackhub'
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hackhub';

mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB Connected (Actual Data Storage)'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    console.log('⚠️  Starting server without database connection');
  });

// --- API ROUTES ---

// 1. GET all hackathons (Fetch from DB)
app.get('/api/hackathons', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.json([]); // Return empty array if not connected
    }
    const hackathons = await Hackathon.find().sort({ createdAt: -1 });

    // Transform hackathons to match frontend expected format
    const transformedHackathons = hackathons.map(hackathon => ({
      id: hackathon._id.toString(),
      title: hackathon.title,
      description: hackathon.description,
      date: hackathon.date,
      registrationDeadline: hackathon.registrationDeadline,
      registrationLink: hackathon.registrationLink,
      platform: hackathon.platform,
      location: hackathon.location,
      prizePool: hackathon.prizePool,
      categories: hackathon.categories || [],
      tags: hackathon.tags || [],
      impressions: hackathon.impressions || 0,
      createdAt: hackathon.createdAt
    }));

    res.json(transformedHackathons);
  } catch (err) {
    console.error('Error fetching hackathons:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. CREATE a new hackathon (Save to DB)
app.post('/api/hackathons', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    // Extract data from request body
    const { id, title, description, date, registrationDeadline, registrationLink,
      platform, location, prizePool, categories, tags, impressions, createdAt } = req.body;
    // Create new hackathon object without the id field (MongoDB will generate _id)
    const hackathonData = {
      title,
      description,
      date,
      registrationDeadline,
      registrationLink,
      platform,
      location,
      prizePool,
      categories,
      tags,
      impressions: impressions || 0,
      createdAt: createdAt || Date.now()
    };

    const newHackathon = new Hackathon(hackathonData);
    const savedHackathon = await newHackathon.save();


    // Add the MongoDB _id as id for frontend compatibility
    const hackathonResponse = {
      ...hackathonData,
      id: savedHackathon._id.toString()
    };

    res.status(201).json(hackathonResponse);
  } catch (err) {
    console.error('Error saving hackathon:', err);
    res.status(400).json({ error: err.message });
  }
});

// 2.1 UPDATE an existing hackathon
app.put('/api/hackathons/:id', async (req, res) => {
  // Removed console.log statements
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const { title, description, date, registrationDeadline, registrationLink,
      platform, location, prizePool, categories, tags, impressions } = req.body;

    const updatedHackathon = await Hackathon.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        date,
        registrationDeadline,
        registrationLink,
        platform,
        location,
        prizePool,
        categories,
        tags,
        impressions
      },
      { new: true } // Return the updated document
    );

    if (!updatedHackathon) {
      return res.status(404).json({ error: 'Hackathon not found' });
    }

    // Add the MongoDB _id as id for frontend compatibility
    const hackathonResponse = {
      ...updatedHackathon.toObject(),
      id: updatedHackathon._id.toString()
    };

    res.json(hackathonResponse);
  } catch (err) {
    console.error('Error updating hackathon:', err);
    res.status(400).json({ error: err.message });
  }
});

// 3. DELETE a hackathon
app.delete('/api/hackathons/:id', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    await Hackathon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Hackathon deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. INCREMENT Impressions
app.post('/api/hackathons/:id/impression', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const hackathon = await Hackathon.findById(req.params.id);
    if (hackathon) {
      hackathon.impressions += 1;
      await hackathon.save();
      res.json({ impressions: hackathon.impressions });
    } else {
      res.status(404).json({ message: 'Hackathon not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. REGISTER a student
app.post('/api/registrations', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    // Extract registration data from request body
    const { studentId, studentName, email, hackathonId } = req.body;

    // If studentId is provided, fetch department and section from user data
    let department = '';
    let section = '';

    if (studentId) {
      try {
        const user = await User.findById(studentId);
        if (user) {
          department = user.department || '';
          section = user.section || '';
        }
      } catch (userErr) {
        // Removed console.log
      }
    }

    // Create new registration with department and section
    const newRegistration = new Registration({
      ...req.body,
      department,
      section
    });

    const savedRegistration = await newRegistration.save();

    // Transform to match frontend expectations
    const transformedRegistration = {
      id: savedRegistration._id.toString(),
      hackathonId: savedRegistration.hackathonId ? savedRegistration.hackathonId.toString() : savedRegistration.hackathonId,
      studentId: savedRegistration.studentId,
      studentName: savedRegistration.studentName,
      email: savedRegistration.email,
      studentEmail: savedRegistration.email,
      status: savedRegistration.status,
      registeredAt: savedRegistration.registeredAt ? new Date(savedRegistration.registeredAt).getTime() : Date.now(),
      timestamp: savedRegistration.registeredAt ? new Date(savedRegistration.registeredAt).getTime() : Date.now(),
      department: savedRegistration.department,
      section: savedRegistration.section
    };

    res.status(201).json({ message: 'Registered successfully', registration: transformedRegistration });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5.1 GET all registrations
app.get('/api/registrations', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.json([]); // Return empty array if not connected
    }
    const registrations = await Registration.find();

    // Transform MongoDB documents to match frontend expectations
    const transformedRegistrations = registrations.map(reg => ({
      id: reg._id.toString(),
      hackathonId: reg.hackathonId ? reg.hackathonId.toString() : reg.hackathonId,
      studentId: reg.studentId,
      studentName: reg.studentName,
      email: reg.email,
      studentEmail: reg.email, // Map email to studentEmail for backward compatibility
      status: reg.status,
      registeredAt: reg.registeredAt ? new Date(reg.registeredAt).getTime() : Date.now(),
      timestamp: reg.registeredAt ? new Date(reg.registeredAt).getTime() : Date.now(),
      department: reg.department,
      section: reg.section
    }));

    res.json(transformedRegistrations);
  } catch (err) {
    console.error('Error fetching registrations:', err);
    res.status(500).json({ error: err.message });
  }
});

// 6. ANALYTICS (Real calculations from DB)
app.get('/api/analytics', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.json({ totalImpressions: 0, totalHackathons: 0, insight: 'No data available' });
    }
    // Count total impressions across all documents
    const result = await Hackathon.aggregate([
      { $group: { _id: null, totalImpressions: { $sum: "$impressions" } } }
    ]);

    const totalImpressions = result.length > 0 ? result[0].totalImpressions : 0;
    const totalHackathons = await Hackathon.countDocuments();

    // Find most popular
    const topHackathon = await Hackathon.findOne().sort({ impressions: -1 });
    const insight = topHackathon
      ? `Most popular: ${topHackathon.title} (${topHackathon.impressions} views)`
      : "No data yet.";

    res.json({ totalImpressions, totalHackathons, insight });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. USER PROFILE ROUTES
app.get('/api/profile/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/profile/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const { name, department, year, registerNo, section, profilePicture, bio, skills } = req.body;

    // Find user and update
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (department) user.department = department;
    if (year) user.year = year;
    if (registerNo) user.registerNo = registerNo;
    if (section !== undefined) user.section = section;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (bio !== undefined) user.bio = bio;
    if (skills !== undefined) user.skills = skills;

    const updatedUser = await user.save();
    const { password: _, ...userWithoutPassword } = updatedUser.toObject();

    res.json({ success: true, user: userWithoutPassword });
  } catch (err) {
    console.error('Profile Update Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 8. GET all student users (for registration management)
app.get('/api/users/students', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    // Fetch all users with STUDENT role, excluding password
    const students = await User.find({ role: 'STUDENT' }).select('-password').sort({ name: 1 });
    res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- AUTH ROUTES ---

// Signup Route
app.post('/api/auth/signup', async (req, res) => {
  console.log("called /api/auth/signup")
  try {
    // Removed console.log statements

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Removed console.log
      return res.status(500).json({ success: false, error: 'Database not connected' });
    }

    const { name, email, password, role, department, year, registerNo, section, secretCode } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Removed console.log
      return res.status(400).json({ success: false, error: 'User already exists with this email' });
    }

    // Check for duplicate registration number (for students)
    if (role === 'STUDENT' && registerNo) {
      const existingRegNo = await User.findOne({ registerNo });
      if (existingRegNo) {
        // Removed console.log
        return res.status(400).json({ success: false, error: 'This registration number is already in use. Please check your registration number.' });
      }
    }

    // Validate citchennai.net email for STUDENTS only (faculty can use any email)
    if (role === 'STUDENT' && !email.endsWith('@citchennai.net')) {
      // Removed console.log
      return res.status(400).json({ success: false, error: 'Students must use an @citchennai.net email address' });
    }

    // Verify SEC_KEY for faculty signups
    if (role === 'FACULTY') {
      const validSecretKey = process.env.SEC_KEY || 'QWERTY123';
      if (!secretCode || secretCode !== validSecretKey) {
        // Removed console.log
        return res.status(403).json({ success: false, error: 'Invalid faculty secret code. Please contact administration.' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Removed console.log
    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      department,
      year,
      registerNo,
      section // Add section field
    });

    const savedUser = await newUser.save();
    // Removed console.log

    // Generate JWT token
    const token = jwt.sign({ id: savedUser._id, role: savedUser.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });

    // Return user data without password
    const { password: _, ...userWithoutPassword } = savedUser.toObject();

    res
      .cookie("auth_token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: '/',
      })

    res.status(201).json({ success: true, user: userWithoutPassword, token });
  } catch (err) {
    console.error('❌ Signup Error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  // Removed console.log
  try {
    // Check if MongoDB is connected
    // Removed console.log
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ Database not connected');
      return res.status(500).json({ success: false, error: 'Database not connected' });
    }

    const { email, password } = req.body;
    // Removed console.log

    // Find user by email
    const user = await User.findOne({ email });
    // Removed console.log
    if (!user) {
      // Removed console.log
      return res.status(400).json({ success: false, error: 'Invalid email or password' });
    }

    // Check password
    // Removed console.log
    const isMatch = await bcrypt.compare(password, user.password);
    // Removed console.log
    if (!isMatch) {
      // Removed console.log
      return res.status(400).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user.toObject();

    // Removed console.log
    res
      .cookie("auth_token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: '/',
      })
      .json({ success: true, user: userWithoutPassword });
  } catch (err) {
    console.error('❌ Login Error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
});

// Restore session from cookie
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) {
      return res.status(401).json({ success: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false });
    }

    return res.json({ success: true, user });
  } catch (err) {
    console.error('❌ Me Auth Error:', err);
    return res.status(401).json({ success: false });
  }
});

// Google Auth Mock Route
app.post('/api/auth/google', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ success: false, error: 'Database not connected' });
    }

    const { email, name } = req.body;

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user for Google auth
      const newUser = new User({
        name,
        email,
        password: '', // No password for Google auth
        role: email.includes('faculty') ? 'FACULTY' : 'STUDENT'
      });
      user = await newUser.save();
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user.toObject();

    res.json({ success: true, user: userWithoutPassword, token });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
});

// --- EXTENSION REAL REGISTRATION ROUTE ---
app.post('/api/extension-webhook', async (req, res) => {
  console.log("========= EXTENSION WEBHOOK HIT =========");
  console.log("📩 RAW BODY:", JSON.stringify(req.body, null, 2));
  console.log("🍪 COOKIES:", req.cookies);
  console.log("=========================================");
  try {
    const { userToken, currentUrl, keyword, domain } = req.body;

    if (!userToken) {
      return res.status(401).json({ success: false, error: 'Missing token' });
    }

    // decode JWT
    let decoded;
    try {
      decoded = jwt.verify(
        userToken,
        process.env.JWT_SECRET || 'fallback_secret'
      );
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // match exact registrationLink (or startsWith for safety)
    const hackathon = await Hackathon.findOne({
      registrationLink: { $regex: currentUrl, $options: 'i' }
    });

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        error: 'No matching hackathon for this external page'
      });
    }

    // duplicate check
    const existing = await Registration.findOne({
      hackathonId: hackathon._id,
      studentId: user._id
    });

    if (existing) {
      return res.json({
        success: true,
        message: 'Already registered',
        registration: existing
      });
    }

    // create registration
    // create registration
    const reg = new Registration({
      studentId: user._id.toString(),
      studentName: user.name,
      email: user.email,
      hackathonId: hackathon._id,
      department: user.department || '',
      section: user.section || '',
      status: 'pending'
    });

    const saved = await reg.save();

    return res.json({
      success: true,
      message: 'Registered via extension',
      registration: saved,
      clearedCookie: true
    });

  } catch (error) {
    console.error('❌ Extension registration error:', error);
    res.status(500).json({ success: false, error: 'Internal error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'Lax',
    path: '/'
  });

  return res.json({ success: true });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});
