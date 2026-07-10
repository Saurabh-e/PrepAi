import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const profile = await userService.getProfile();
      setUser(profile);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to load profile:', error);
      handleLogoutLocal();
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutLocal = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const authData = await authService.login(email, password);
      // After login, fetch the complete profile to store details
      await fetchProfile();
      return authData;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (firstName, lastName, email, password) => {
    setLoading(true);
    try {
      const authData = await authService.register(firstName, lastName, email, password);
      await fetchProfile();
      return authData;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout API failure:', error);
    } finally {
      handleLogoutLocal();
    }
  };

  // Check if token exists on load, then bootstrap profile
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }

    // Listen for logout events triggered by axios interceptor on token expiry
    const handleLogoutEvent = () => {
      handleLogoutLocal();
    };
    window.addEventListener('auth-logout', handleLogoutEvent);

    return () => {
      window.removeEventListener('auth-logout', handleLogoutEvent);
    };
  }, []);

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ADMIN') || false;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        register,
        logout,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
