import { Router } from "express";
import mongoose from "mongoose";
import Hackathon from "../models/Hackathon.js";

const analytics = Router();

analytics.get('/', async (req, res) => {
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

export default analytics;