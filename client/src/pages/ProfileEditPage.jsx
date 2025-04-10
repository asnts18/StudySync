import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import universityService from '../api/universityService';

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const { currentUser, updateProfile, error: authError, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    bio: '',
    university_id: ''
  });
  
  const [universities, setUniversities] = useState([]);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Fetch universities on component mount
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const data = await universityService.getAllUniversities();
        setUniversities(data);
      } catch (err) {
        console.error('Error fetching universities:', err);
      }
    };

    fetchUniversities();
  }, []);

  // Load current user data into form
  useEffect(() => {
    if (currentUser) {
      setFormData({
        email: currentUser.email || '',
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        bio: currentUser.bio || '',
        university_id: currentUser.university_id || ''
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear field-specific error when user types
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Simple validation
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (formData.bio && formData.bio.length > 500) newErrors.bio = 'Bio must be less than 500 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setMessage('');
    setIsSuccess(false);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      // Use updateProfile function from AuthContext
      await updateProfile(formData);
      setIsSuccess(true);
      setMessage('Profile updated successfully!');
      
      // Scroll to top to show success message
      window.scrollTo(0, 0);
      
      // Redirect back to profile page after short delay
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err) {
      console.error('Profile update error:', err);
      setMessage(err.response?.data?.message || 'Failed to update profile. Please try again.');
      setIsSuccess(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-2xl mx-auto px-8 py-12">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-12">
          <button 
            onClick={() => navigate('/profile')} 
            className="p-2 border-2 border-black hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-4xl font-bold">edit profile</h1>
        </div>

        {/* Success message */}
        {message && (
          <div className={`mb-6 p-4 border-2 ${isSuccess ? 'border-green-500 bg-green-100 text-green-700' : 'border-red-500 bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        {/* Error message from auth context */}
        {authError && (
          <div className="mb-6 p-4 border-2 border-red-500 bg-red-100 text-red-700">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="first_name" className="block text-lg text-left">
                First Name
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                value={formData.first_name}
                onChange={handleChange}
                className={`w-full p-4 border-2 ${
                  errors.first_name ? 'border-red-500' : 'border-black'
                } focus:outline-none`}
              />
              {errors.first_name && (
                <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="last_name" className="block text-lg text-left">
                Last Name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                value={formData.last_name}
                onChange={handleChange}
                className={`w-full p-4 border-2 ${
                  errors.last_name ? 'border-red-500' : 'border-black'
                } focus:outline-none`}
              />
              {errors.last_name && (
                <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-lg text-left">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-4 border-2 ${
                errors.email ? 'border-red-500' : 'border-black'
              } focus:outline-none`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="university_id" className="block text-lg text-left">
              University
            </label>
            <select
              id="university_id"
              name="university_id"
              value={formData.university_id}
              onChange={handleChange}
              className="w-full p-4 border-2 border-black focus:outline-none appearance-none bg-white"
            >
              <option value="">Select your university</option>
              {universities.map((university) => (
                <option key={university.university_id} value={university.university_id}>
                  {university.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="block text-lg text-left">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className={`w-full p-4 border-2 ${
                errors.bio ? 'border-red-500' : 'border-black'
              } focus:outline-none h-32`}
              placeholder="Tell us a bit about yourself..."
            />
            <p className="text-sm text-gray-500">{formData.bio ? formData.bio.length : 0}/500 characters</p>
            {errors.bio && (
              <p className="text-red-500 text-sm">{errors.bio}</p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex-1 px-6 py-4 border-2 border-black hover:bg-gray-100 transition-colors text-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-primary-yellow border-2 border-black hover:bg-dark-yellow transition-colors text-xl disabled:opacity-70"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ProfileEditPage;