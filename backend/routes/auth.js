import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

const auth = Router();
const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV == "production";
const SHOW_LOGS = (!isProduction) || process.env.SHOW_LOGS == '1';

auth.post('/signup', async (req, res) => {
    SHOW_LOGS && console.log("called /api/auth/signup")
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
        SHOW_LOGS && console.error('❌ Signup Error:', err);
        SHOW_LOGS && console.error('Error stack:', err.stack);
        res.status(500).json({ success: false, error: err.message || 'Internal server error' });
    }
});

// Login Route
auth.post('/login', async (req, res) => {
    // Removed console.log
    try {
        // Check if MongoDB is connected
        // Removed console.log
        if (mongoose.connection.readyState !== 1) {
            SHOW_LOGS && console.error('❌ Database not connected');
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
        SHOW_LOGS && console.error('❌ Login Error:', err);
        SHOW_LOGS && console.error('Error stack:', err.stack);
        res.status(500).json({ success: false, error: err.message || 'Internal server error' });
    }
});

// Restore session from cookie
auth.get('/me', async (req, res) => {
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
        SHOW_LOGS && console.error('❌ Me Auth Error:', err);
        return res.status(401).json({ success: false });
    }
});

// Google Auth Mock Route
auth.post('/google', async (req, res) => {
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
        SHOW_LOGS && console.error('Google Auth Error:', err);
        res.status(500).json({ success: false, error: err.message || 'Internal server error' });
    }
});

auth.post('/logout', (req, res) => {
    res.clearCookie('auth_token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'Lax',
        path: '/'
    });

    return res.json({ success: true });
});

export default auth;