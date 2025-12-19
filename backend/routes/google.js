// routes/google.js
import { Router } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import User from "../models/User.js";
import { verifyGoogleToken } from "../utils/verifyGoogleToken.js";

const google = Router();
const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

/**
 * GOOGLE LOGIN
 * - Verifies Google token
 * - Logs in user if email exists
 */
google.post("/login", async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({
                success: false,
                error: "Database not connected",
            });
        }

        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({
                success: false,
                error: "Missing Google token",
            });
        }

        const { email } = await verifyGoogleToken(idToken);

        const user = await User.findOne({ email }).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found. Please sign up first.",
            });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res
            .cookie("auth_token", token, {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? "none" : "lax",
                path: "/",
            })
            .json({ success: true, user });

    } catch (err) {
        res.status(401).json({
            success: false,
            error: "Invalid Google token",
        });
    }
});

export default google;
