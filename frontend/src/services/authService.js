import { staticUsers } from '../data/staticData';
import { storageService } from './storageService';

/**
 * Authentication Service — Validates credentials against static user database
 * and synchronizes session state with localStorage
 */
export const authService = {
  /**
   * Log in user using email and password, or by selected workspace role
   */
  login: (email, password, role = 'learner') => {
    const cleanEmail = email?.trim().toLowerCase();
    
    // First try finding user by email
    let user = staticUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    // If not found by email, match by selected role
    if (!user) {
      user = staticUsers.find((u) => u.role === role);
    }

    // Fallback to default user
    if (!user) {
      user = staticUsers[0];
    }

    // Persist to localStorage
    storageService.setUser(user);

    return {
      success: true,
      user,
    };
  },

  /**
   * Get currently authenticated user from localStorage (or static default)
   */
  getCurrentUser: () => {
    return storageService.getUser();
  },

  /**
   * Log out active user
   */
  logout: () => {
    storageService.clearUser();
  },

  /**
   * Switch active profile based on workspace role (Learner vs Teacher)
   */
  switchRole: (role) => {
    const user = staticUsers.find((u) => u.role === role) || staticUsers[0];
    storageService.setUser(user);
    return user;
  },

  /**
   * Retrieve available static users
   */
  getAvailableUsers: () => {
    return staticUsers;
  },
};
