/**
 * Resume Analyzer Backend Server
 *
 * This is the main entry point for the Resume Analyzer backend application.
 * It sets up the Express server, connects to MongoDB, and starts listening for requests.
 *
 * Architecture:
 * - Express.js for HTTP server and routing
 * - MongoDB for data persistence
 * - JWT for authentication
 * - Ollama for AI-powered resume analysis
 *
 * @author Resume Analyzer Team
 * @version 1.0.0
 */

require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

/**
 * Server port configuration
 * Uses environment variable PORT or defaults to 3000
 * @type {number}
 */
const port = process.env.PORT || 3000;

/**
 * Initialize server with database connection
 *
 * Connects to MongoDB first, then starts the Express server.
 * If database connection fails, the process exits with error code 1.
 *
 * @async
 * @function startServer
 * @returns {Promise<void>}
 */
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

