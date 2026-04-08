/**
 * Main Application Component
 *
 * Defines the routing structure for the Resume Analyzer application.
 * Uses React Router to handle client-side navigation between different pages.
 *
 * Route Structure:
 * - / (Landing) - Public marketing page
 * - /login - User authentication
 * - /signup - User registration
 * - /dashboard - Main dashboard (protected)
 * - /analyze - Resume upload and analysis (protected)
 * - /results - Analysis results display (protected)
 * - /history - Analysis history viewer (protected)
 * - /editor - Resume editor interface (protected)
 *
 * Protected routes are wrapped with ProtectedRoute component that
 * checks authentication status and redirects to login if needed.
 *
 * @module App
 * @requires react
 * @requires react-router-dom
 * @requires ./components/layout/DashboardLayout
 * @requires ./pages/AnalyzeResume
 * @requires ./pages/ResultsDashboard
 * @requires ./pages/History
 * @requires ./pages/Login
 * @requires ./pages/Register
 * @requires ./components/auth/ProtectedRoute
 * @requires ./pages/ResumeEditor
 * @requires ./pages/Landing
 * @requires ./pages/Dashboard
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import AnalyzeResume from './pages/AnalyzeResume';
import ResultsDashboard from './pages/ResultsDashboard';
import History from './pages/History';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ResumeEditor from './pages/ResumeEditor';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';

/**
 * Application Component
 *
 * The root component that defines all application routes.
 * Uses nested routing with layout components for consistent UI structure.
 *
 * @returns {JSX.Element} The router configuration with all routes
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Fullscreen Editor */}
          <Route path="/editor" element={<ResumeEditor />} />
          
          {/* Dashboard layout with Sidebar */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analyze" element={<AnalyzeResume />} />
            <Route path="/results" element={<ResultsDashboard />} />
            <Route path="/history" element={<History />} />
          </Route>
        </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;