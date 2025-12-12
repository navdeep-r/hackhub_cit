import { Router } from "express";
import Registration from "../models/Registration.js";
import User from "../models/User.js";
import Hackathon from "../models/Hackathon.js";
import jwt from 'jsonwebtoken';

const extension_webhook = Router();
const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV == "production";
const SHOW_LOGS = (!isProduction) || process.env.SHOW_LOGS == '1';

extension_webhook.post('/', async (req, res) => {
    SHOW_LOGS && console.log("========= EXTENSION WEBHOOK HIT =========");
    SHOW_LOGS && console.log("📩 RAW BODY:", JSON.stringify(req.body, null, 2));
    SHOW_LOGS && console.log("🍪 COOKIES:", req.cookies);
    SHOW_LOGS && console.log("=========================================");
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

export default extension_webhook;