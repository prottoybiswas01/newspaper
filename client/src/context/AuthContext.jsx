import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Initialize and verify user auth status
  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          if (res.success) {
            setUser(res.user);
          } else if (res.message && res.message.toLowerCase().includes('authorized')) {
            // Token explicitly invalid or expired
            logout();
          }
        } catch (e) {
          console.error('Profile fetch failed:', e);
          // If offline or network issue, don't clear token immediately, but set loading false
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success) {
        localStorage.setItem('token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true };
      } else {
        return { success: false, message: res.message || 'Login failed' };
      }
    } catch (err) {
      return { success: false, message: err.message || 'Network error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (res.success) {
        localStorage.setItem('token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true };
      } else {
        return { success: false, message: res.message || 'Registration failed' };
      }
    } catch (err) {
      return { success: false, message: err.message || 'Network error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Check roles helper: Super Admin / Admin has full clearance bypass (case-insensitive)
  const hasPermission = (allowedRoles = []) => {
    if (!user) return false;
    const role = (user.role || '').trim().toLowerCase();
    if (role === 'super admin' || role === 'admin') return true;
    return allowedRoles.some(r => r.trim().toLowerCase() === role);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, hasPermission }}>
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
