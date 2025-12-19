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

/**
 * GOOGLE SIGNUP
 * - Google verifies email
 * - User STILL sets password
 * - Account can login via password or Google
 */
google.post("/signup", async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({
                success: false,
                error: "Database not connected",
            });
        }

        const {
            idToken,
            password,
            role,
            department,
            year,
            registerNo,
            section,
            secretCode,
        } = req.body;

        if (!idToken || !password) {
            return res.status(400).json({
                success: false,
                error: "Google token and password are required",
            });
        }

        const { email, name, picture } = await verifyGoogleToken(idToken);

        // Prevent duplicate email
        if (await User.findOne({ email })) {
            return res.status(400).json({
                success: false,
                error: "User already exists with this email",
            });
        }

        // STUDENT email format restriction
        if (role === "STUDENT" && !email.endsWith("@citchennai.net")) {
            return res.status(400).json({
                success: false,
                error: "Students must use a @citchennai.net email",
            });
        }

        // Duplicate register number check
        if (role === "STUDENT" && registerNo) {
            const existingRegNo = await User.findOne({ registerNo });
            if (existingRegNo) {
                return res.status(400).json({
                    success: false,
                    error: "Registration number already exists",
                });
            }
        }

        // Faculty secret validation
        if (role === "FACULTY") {
            if (!secretCode || secretCode !== process.env.SEC_KEY) {
                return res.status(403).json({
                    success: false,
                    error: "Invalid faculty secret code",
                });
            }
        }

        // Hash password like normal signup
        const bcrypt = await import("bcryptjs");
        const hashedPassword = await bcrypt.default.hash(password, 10);
        const finalName = req.body.name?.trim()
            ? req.body.name.trim()
            : googleData.name;

        const user = await new User({
            name: finalName,
            email,
            password: hashedPassword,
            role,
            department,
            year,
            registerNo,
            section,
            profilePicture: picture,
        }).save();

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        const { password: _, ...userWithoutPassword } = user.toObject();

        res
            .cookie("auth_token", token, {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? "none" : "lax",
                path: "/",
            })
            .status(201)
            .json({ success: true, user: userWithoutPassword });

    } catch (err) {
        res.status(401).json({
            success: false,
            error: "Invalid Google token",
        });
    }
});

export default google;
