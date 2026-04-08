/**
 * Express Application Configuration
 *
 * This module configures the main Express application with middleware,
 * routes, and error handling for the Resume Analyzer API.
 *
 * Middleware Stack:
 * 1. CORS - Cross-origin resource sharing
 * 2. JSON/URL-encoded body parsing
 * 3. Static file serving for uploads
 * 4. Authentication routes (/api/auth)
 * 5. Resume/Analysis routes (/api)
 * 6. Global error handling
 *
 * @module app
 * @requires express
 * @requires cors
 * @requires path
 * @requires ./routes/resume.routes
 * @requires ./routes/auth.routes
 * @requires ./middlewares/error.middleware
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const resumeRoutes = require('./routes/resume.routes');
const authRoutes = require('./routes/auth.routes');
const errorHandler = require('./middlewares/error.middleware');

/**
 * Express application instance
 * @type {express.Application}
 */
const app = express();

// CORS configuration - allows requests from frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// Static file serving for uploaded resumes
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes); // Authentication endpoints
app.use('/api', resumeRoutes);    // Resume and analysis endpoints

// Global error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;