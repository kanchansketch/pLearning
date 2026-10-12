import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Load user from localStorage / staticData
  const [user, setUser] = useState(() => authService.getCurrentUser());

  // Load courses from localStorage / staticData
  const [courses, setCourses] = useState(() => storageService.getCourses());

  // Currently active course (defaults to Architectural Spatial Mastery)
  const [activeCourseId, setActiveCourseId] = useState(() => {
    const active = storageService.getActiveCourse();
    return active?.id || 'c-arch-spatial-001';
  });

  const activeCourse = courses.find((c) => c.id === activeCourseId) || courses[0];

  // Sync active course to localStorage whenever it changes
  useEffect(() => {
    if (activeCourseId) {
      storageService.setActiveCourseId(activeCourseId);
    }
  }, [activeCourseId]);

  // Login handler
  const login = (email, password, role) => {
    const result = authService.login(email, password, role);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  // Logout handler
  const logout = () => {
    authService.logout();
    // Default back to learner for seamless experience
    const defaultUser = authService.switchRole('learner');
    setUser(defaultUser);
  };

  // Switch workspace role
  const switchWorkspaceRole = (role) => {
    const newUser = authService.switchRole(role);
    setUser(newUser);
    return newUser;
  };

  // Toggle lesson complete & save to localStorage
  const toggleLessonComplete = (courseId, lessonId) => {
    const result = storageService.toggleLessonComplete(courseId, lessonId);
    setCourses(result.courses);
    return result;
  };

  // Reset to static defaults
  const resetAllProgress = () => {
    const defaults = storageService.resetToDefaults();
    setUser(defaults.user);
    setCourses(defaults.courses);
    setActiveCourseId('c-arch-spatial-001');
  };

  const value = {
    user,
    courses,
    activeCourse,
    setActiveCourseId,
    login,
    logout,
    switchWorkspaceRole,
    toggleLessonComplete,
    resetAllProgress,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
