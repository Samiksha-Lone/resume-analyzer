/**
 * React Application Entry Point
 *
 * Initializes the Resume Analyzer React application with context providers
 * and renders the root component to the DOM.
 *
 * Provider Hierarchy:
 * 1. ThemeProvider - Manages UI theme state (light/dark mode)
 * 2. AuthProvider - Manages user authentication state and JWT tokens
 * 3. ResumeProvider - Manages resume data and analysis operations
 *
 * The application uses React Router for client-side routing and
 * React Context API for global state management.
 *
 * @module main
 * @requires react
 * @requires react-dom/client
 * @requires ./index.css
 * @requires ./App.jsx
 * @requires ./context/ThemeContext
 * @requires ./context/AuthContext
 * @requires ./context/ResumeContext
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { ResumeProvider } from './context/ResumeContext'

/**
 * Render the React application
 *
 * Creates a React root and renders the application with all necessary providers.
 * The app is wrapped in StrictMode for development warnings and best practices.
 *
 * DOM Element: The app renders into the element with id 'root'
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <ResumeProvider>
          <App />
        </ResumeProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
