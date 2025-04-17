
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
      
      const response = await api.post('/auth/signup', {
        email: userData.email,
        password: userData.password,
        first_name: userData.first_name,
        last_name: userData.last_name,
        bio: userData.bio || '',
        university_id: userData.university_id || null
      });
      
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
      
      const response = await api.post('/auth/signin', { email, password });
      
      // Store token
      localStorage.setItem('token', response.data.accessToken);
      
      // Store user info - make sure password is not included
      const userWithoutPassword = { ...response.data };
      delete userWithoutPassword.password;
      
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      setCurrentUser(userWithoutPassword);
      
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

  // Update user profile - simplified version
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError('');
      
      // Log the data we're sending
      console.log("Updating profile with:", userData);
      
      // Update profile
      const response = await api.put('/users/profile', userData);
      
      // Log the raw response
      console.log("Raw update response:", response);
      
      // Extract user info - handle both flat and nested structure possibilities
      let updatedUserData = response.data;
      
      // Update the current user with the new data, keeping any existing properties
      const updatedUser = { 
        ...currentUser, 
        ...userData,  // Include the data we submitted (as fallback)
        ...updatedUserData // Override with server response data
      };
      
      console.log("Final updated user:", updatedUser);
      
      // Save to localStorage and state
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      return updatedUser;
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get current user profile - simplified
  const getProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/users/profile');
      console.log("Raw profile response:", response);
      
      // Extract profile data (might be nested)
      const profileData = response.data;
      
      // Update the current user with the new data, keeping original properties
      const updatedUser = { ...currentUser, ...profileData };
      console.log("Updated user after get profile:", updatedUser);
      
      // Save to localStorage and state
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      return updatedUser;
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