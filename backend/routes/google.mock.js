// routes/google.mock.js
import { Router } from "express";

const google = Router();

/**
 * MOCK GOOGLE LOGIN
 */
google.post("/login", async (req, res) => {
    console.log("🧪 [MOCK] called /api/auth/google/login");
    console.log("📦 Payload:", JSON.stringify(req.body, null, 2));

    return res.status(501).json({
        success: false,
        error: "Google login not enabled (mock route)",
    });
});

/**
 * MOCK GOOGLE SIGNUP
 */
google.post("/signup", async (req, res) => {
    console.log("🧪 [MOCK] called /api/auth/google/signup");
    console.log("📦 Payload:", JSON.stringify(req.body, null, 2));

    return res.status(501).json({
        success: false,
        error: "Google signup not enabled (mock route)",
    });
});

export default google;
