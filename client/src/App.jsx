import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Public Landing Page
import Landing from './pages/Landing';

// Authentication Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

// Authenticated Application Layout
import AppLayout from './layouts/AppLayout';

// Core SmartPrep Pages
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import SubjectDetail from './pages/SubjectDetail';
import Exams from './pages/Exams';
import StudyPlan from './pages/StudyPlan';
import StudySessions from './pages/StudySessions';
import Progress from './pages/Progress';
import Profile from './pages/Profile';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Landing Pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />

        {/* Public Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Authenticated Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/subjects/:id" element={<SubjectDetail />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/study-plan" element={<StudyPlan />} />
          <Route path="/study-sessions" element={<StudySessions />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Fallback Catch-all Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
