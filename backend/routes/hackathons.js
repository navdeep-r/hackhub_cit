import { Router } from 'express';
import mongoose from 'mongoose';
import Hackathon from '../models/Hackathon.js';

const hackathons = Router();
const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV == "production";
const SHOW_LOGS = (!isProduction) || process.env.SHOW_LOGS == '1';


hackathons.get('/', async (req, res) => {
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
        SHOW_LOGS && console.error('Error fetching hackathons:', err);
        res.status(500).json({ error: err.message });
    }
});

// CREATE a new hackathon (Save to DB)
hackathons.post('/', async (req, res) => {
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
        SHOW_LOGS && console.error('Error saving hackathon:', err);
        res.status(400).json({ error: err.message });
    }
});

// UPDATE an existing hackathon
hackathons.put('/:id', async (req, res) => {
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
        SHOW_LOGS && console.error('Error updating hackathon:', err);
        res.status(400).json({ error: err.message });
    }
});

// DELETE a hackathon
hackathons.delete('/:id', async (req, res) => {
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

// INCREMENT Impressions
hackathons.post('/:id/impression', async (req, res) => {
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

export default hackathons;