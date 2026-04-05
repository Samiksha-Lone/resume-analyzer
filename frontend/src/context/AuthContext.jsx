import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  const api = axios.create({
    baseURL: 'http://localhost:3000/api'
  });

  // Inject token into every request if it exists and preserve FormData uploads
  api.interceptors.request.use((config) => {
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }

    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data?.data?.user || res.data);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const responseData = res.data?.data || res.data;
      const { token: newToken, user: userData } = responseData;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      return res.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Login failed';
      throw new Error(message);
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/signup', { name, email, password });
      const responseData = res.data?.data || res.data;
      const { token: newToken, user: userData } = responseData;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      return res.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Registration failed';
      throw new Error(message);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, isLoading, login, register, logout, api }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
