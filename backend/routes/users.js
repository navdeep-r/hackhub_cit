import { Router } from "express";
import mongoose from "mongoose";
import User from "../models/User.js";

const users = Router();
const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV == "production";
const SHOW_LOGS = (!isProduction) || process.env.SHOW_LOGS == '1';

users.get('/students', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({ error: 'Database not connected' });
        }

        // Fetch all users with STUDENT role, excluding password
        const students = await User.find({ role: 'STUDENT' }).select('-password').sort({ name: 1 });
        res.json(students);
    } catch (err) {
        SHOW_LOGS && console.error('Error fetching students:', err);
        res.status(500).json({ error: err.message });
    }
});

export default users;