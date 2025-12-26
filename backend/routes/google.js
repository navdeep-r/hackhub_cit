// routes/google.js
import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import { verifyGoogleToken } from "../utils/verifyGoogleToken.js";

const google = Router();
const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

/**
 * NEW: COMPLETE GOOGLE SIGNUP
 * - Finalizes signup after redirect-based Google auth
 * - Requires explicit form completion
 */
google.post("/complete-signup", async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({
                success: false,
                error: "Database not connected",
            });
        }


        const {
            signupToken,
            role,
            department,
            year,
            registerNo,
            section,
            secretCode,
            password, // optional if you want password support
        } = req.body;

        if (!signupToken) {
            return res.status(400).json({
                success: false,
                error: "Missing signup token",
            });
        }

        // Verify temporary signup token
        let googleIdentity;
        try {
            googleIdentity = jwt.verify(
                signupToken,
                process.env.JWT_SECRET
            );
        } catch {
            return res.status(401).json({
                success: false,
                error: "Invalid or expired signup token",
            });
        }

        const { email, picture } = googleIdentity;
        const name =
            req.body.name && req.body.name.trim()
                ? req.body.name.trim()
                : googleIdentity.name;


        // Prevent duplicate users
        if (await User.findOne({ email })) {
            return res.status(400).json({
                success: false,
                error: "User already exists",
            });
        }

        // STUDENT email restriction
        if (role === "STUDENT" && !email.endsWith("@citchennai.net")) {
            return res.status(400).json({
                success: false,
                error: "Students must use a @citchennai.net email",
            });
        }

        // Duplicate register number check
        if (role === "STUDENT" && registerNo) {
            const existingReg = await User.findOne({ registerNo });
            if (existingReg) {
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

        // OPTIONAL: allow password-based login later
        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const user = await new User({
            name,
            email,
            password: hashedPassword || "GOOGLE_AUTH",
            role,
            department,
            year,
            registerNo,
            section,
            profilePicturePreset: 'google',
            googleProfileImage: picture,
        }).save();

        // Issue auth cookie
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            path: "/",
        });

        const { password: _, ...userWithoutPassword } = user.toObject();

        return res.json({
            success: true,
            user: userWithoutPassword,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: JSON.stringify(err),
        });
    }
});

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
 * NEW: GOOGLE OAUTH REDIRECT (Entry Point)
 * - Redirects user to Google consent screen
 * - Used for BOTH login and signup
 */
google.get("/redirect", (_req, res) => {
    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
        prompt: "consent",
    });

    res.redirect(
        `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    );
});

/**
 * NEW: GOOGLE OAUTH CALLBACK
 * - Handles redirect from Google
 * - Exchanges code for tokens
 * - Detects login vs signup
 * - NEVER auto-creates users
 */
google.get("/callback", async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.redirect(
                `${process.env.FRONTEND_ORIGIN}/login?error=google_auth_failed`
            );
        }

        // Exchange authorization code for tokens
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.GOOGLE_REDIRECT_URI,
                grant_type: "authorization_code",
            }),
        });

        const tokenData = await tokenRes.json();

        if (!tokenData.id_token) {
            return res.redirect(
                `${process.env.FRONTEND_ORIGIN}/login?error=google_token_error`
            );
        }

        // Decode Google identity
        const googleUser = jwt.decode(tokenData.id_token);

        const { email, name, picture } = googleUser;

        // Check if user already exists
        const existingUser = await User.findOne({ email }).select("-password");

        // CASE 1: Existing user → LOGIN
        if (existingUser) {
            const token = jwt.sign(
                { id: existingUser._id, role: existingUser.role },
                process.env.JWT_SECRET,
                { expiresIn: "24h" }
            );

            res.cookie("auth_token", token, {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? "none" : "lax",
                path: "/",
            });

            return res.redirect(process.env.FRONTEND_ORIGIN);
        }

        // CASE 2: New user → SIGNUP REQUIRED
        // Create short-lived signup token (identity only)
        const signupToken = jwt.sign(
            { email, name, picture },
            process.env.JWT_SECRET,
            { expiresIn: "10m" }
        );

        return res.redirect(
            `${process.env.FRONTEND_ORIGIN}/#/complete-signup?token=${signupToken}`
        );
    } catch (err) {
        return res.redirect(
            `${process.env.FRONTEND_ORIGIN}/#/?error=google_callback_failed`
        );
    }
});

export default google;
