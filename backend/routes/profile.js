import { Router } from "express";
import mongoose from "mongoose";
import User from "../models/User.js";

const profile = Router();
const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV == "production";
const SHOW_LOGS = (!isProduction) || process.env.SHOW_LOGS == '1';

profile.get('/:id', async (req, res) => {
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

profile.put('/:id', async (req, res) => {
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
        SHOW_LOGS && console.error('Profile Update Error:', err);
        res.status(500).json({ error: err.message });
    }
});

export default profile;