import { config } from "dotenv";
import express from 'express';
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import logEnv from "./utils/logEnv.js";
import generateCorsOptions from "./utils/corsOptions.js";
import api from "./routes/api.js";

// Definitions
config();
const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5174";
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hackhub';
const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV == "production";
const SHOW_LOGS = (!isProduction) || process.env.SHOW_LOGS == '1';
const corsOptions = generateCorsOptions(FRONTEND_ORIGIN);

// Log environment configuration (helpful for debugging deployment issues)
logEnv(PORT, FRONTEND_ORIGIN, NODE_ENV, isProduction);

// Middleware
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- API ROUTES ---
SHOW_LOGS && app.use((req, res, next) => {
  console.log(req.url);
  next();
});
app.use('/api', api);

/*
  --- DATABASE CONNECTION ---
  If you have a cloud URL, put it in a .env file as MONGODB_URI
  Otherwise, this defaults to a local database named 'hackhub'
*/
mongoose.connect(mongoURI)
  .then(() => {
    SHOW_LOGS && console.log('✅ MongoDB Connected (Actual Data Storage)');

    app.listen(PORT, () => {
      SHOW_LOGS && console.log(`🚀 Server running on ${PORT}`);
    });

  })
  .catch(err => {
    SHOW_LOGS && console.error('❌ MongoDB Connection Error:', err);
    SHOW_LOGS && console.log('⚠️  Starting server without database connection');

  });
