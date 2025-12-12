import { Router } from "express";
import mongoose from "mongoose";
import Registration from "../models/Registration.js";
import User from "../models/User.js";

const registrations = Router();
const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV == "production";
const SHOW_LOGS = (!isProduction) || process.env.SHOW_LOGS == '1';

registrations.post('/', async (req, res) => {
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
registrations.get('/', async (req, res) => {
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
            registeredAt: reg.registeredAt ? new Date(reg.registeredAt).getTime() : Date.now(),
            timestamp: reg.registeredAt ? new Date(reg.registeredAt).getTime() : Date.now(),
            department: reg.department,
            section: reg.section
        }));

        res.json(transformedRegistrations);
    } catch (err) {
        SHOW_LOGS && console.error('Error fetching registrations:', err);
        res.status(500).json({ error: err.message });
    }
});

export default registrations;