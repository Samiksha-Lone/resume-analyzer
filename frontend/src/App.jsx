import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ResumeProvider } from './context/ResumeContext';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import AnalyzeResume from './pages/AnalyzeResume';
import ResultsDashboard from './pages/ResultsDashboard';
import History from './pages/History';
import CompareResults from './pages/CompareResults';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ResumeEditor from './pages/ResumeEditor';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ResumeProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Register />} />
              <Route path="/" element={<Navigate to="/analyze" replace />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                {/* Fullscreen Editor */}
                <Route path="/editor" element={<ResumeEditor />} />
                
                {/* Dashboard layout with Sidebar */}
                <Route element={<DashboardLayout />}>
                  <Route path="/analyze" element={<AnalyzeResume />} />
                  <Route path="/results" element={<ResultsDashboard />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/compare-results" element={<CompareResults />} />
                </Route>
              </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ResumeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;