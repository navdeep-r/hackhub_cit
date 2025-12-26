import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import google from "./google.js";
// import google from "./google.mock.js";

const auth = Router();
const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV == "production";
const SHOW_LOGS = (!isProduction) || process.env.SHOW_LOGS == '1';

auth.use('/google', google);

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

auth.post('/logout', (_req, res) => {
    res.clearCookie('auth_token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'Lax',
        path: '/'
    });

    return res.json({ success: true });
});

export default auth;