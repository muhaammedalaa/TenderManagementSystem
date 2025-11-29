import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

const LOCAL_STORAGE_KEY = 'tms_auth_state_v1';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.token && parsed?.user) {
            setToken(parsed.token);
            setUser(parsed.user);
            
            // Verify token is still valid
            try {
              const response = await authAPI.getCurrentUser();
              setUser(response.data);
            } catch (error) {
              // Token is invalid, clear auth state
              setToken(null);
              setUser(null);
              localStorage.removeItem(LOCAL_STORAGE_KEY);
            }
          }
        }
      } catch (err) {
        console.warn('Error initializing auth:', err);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (token && user) {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ token, user })
      );
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [token, user]);

  const login = async ({ username, password }) => {
    if (!username || !password) {
      const error = new Error('Username and password are required');
      error.code = 'MISSING_CREDENTIALS';
      throw error;
    }

    try {
      const response = await authAPI.login({ username, password });
      
      const { token: newToken, user: newUser } = response.data;
      
      setToken(newToken);
      setUser(newUser);
      
      return { token: newToken, user: newUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token: newToken, user: newUser } = response.data;
      
      setToken(newToken);
      setUser(newUser);
      
      return { token: newToken, user: newUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      throw new Error(message);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    register,
    logout,
  }), [user, token, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};


