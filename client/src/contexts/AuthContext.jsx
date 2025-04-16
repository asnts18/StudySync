import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// Create a context
const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if user is logged in on initial load
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  // Register a new user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError('');
      
      // This matches the format expected by your auth.controller.js signup method
      const response = await api.post('/auth/signup', {
        email: userData.email,
        password: userData.password,
        first_name: userData.first_name,
        last_name: userData.last_name,
        bio: userData.bio || '',
        university_id: userData.university_id || null
      });
      
      // Handle successful registration
      console.log('Registration successful:', response.data);
      
      // Redirect to login after registration
      navigate('/login', { 
        state: { message: 'Registration successful! Please log in.' }
      });
      
      return response.data;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login a user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError('');
      
      // This matches your auth.controller.js signin method
      const response = await api.post('/auth/signin', { email, password });
      
      // Based on your auth.controller.js, the token is returned as accessToken
      localStorage.setItem('token', response.data.accessToken);
      
      // Store user info without the password
      const { password: _, ...userWithoutPassword } = response.data;
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      // Update current user state
      setCurrentUser(userWithoutPassword);
      
      // Redirect to home page
      navigate('/home');
      
      return userWithoutPassword;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout a user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    navigate('/');
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.put('/users/profile', userData);
      
      // Update stored user data
      const updatedUser = { ...currentUser, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      return response.data;
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get current user profile
  const getProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/users/profile');
      
      // Update stored user data
      const updatedUser = { ...currentUser, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      return response.data;
    } catch (err) {
      console.error('Get profile error:', err);
      setError(err.response?.data?.message || 'Failed to fetch profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    getProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;