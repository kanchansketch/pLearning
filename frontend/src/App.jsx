import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ClassroomPage from "./pages/ClassroomPage";
import TeacherDashboardPage from "./pages/TeacherDashboardPage";
import CurriculumBuilderPage from "./pages/CurriculumBuilderPage";

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          {/* Learner routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/classroom" element={<ClassroomPage />} />
          {/* Teacher routes */}
          <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
          <Route path="/teacher/curriculum" element={<CurriculumBuilderPage />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}
