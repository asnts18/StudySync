import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { validateForm, registerFormRules } from '../utils/validationUtils';
import api from '../api/axios';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, error: authError, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    bio: '',
    university_id: ''
  });
  
  const [errors, setErrors] = useState({});
  const [universities, setUniversities] = useState([]);

  // Fetch universities on component mount
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await api.get('/universities');
        setUniversities(response.data);
      } catch (err) {
        console.error('Error fetching universities:', err);
      }
    };

    fetchUniversities();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const { isValid, errors: validationErrors } = validateForm(formData, registerFormRules);
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Use register function from AuthContext
      await register(formData);
      // Redirect will be handled in the register function
    } catch (err) {
      // Error handling is done in the AuthContext
      console.error('Registration submission error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-md mx-auto px-8 py-12">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-12">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 border-2 border-black hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-4xl font-bold">register</h1>
        </div>

        {/* Error message */}
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
                placeholder="Jane"
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
                placeholder="Doe"
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
              placeholder="your@email.com"
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
              className={`w-full p-4 border-2 ${
                errors.university_id ? 'border-red-500' : 'border-black'
              } focus:outline-none appearance-none bg-white`}
            >
              <option value="">Select your university</option>
              {universities.map((university) => (
                <option key={university.university_id} value={university.university_id}>
                  {university.name}
                </option>
              ))}
            </select>
            {errors.university_id && (
              <p className="text-red-500 text-sm mt-1">{errors.university_id}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-lg text-left">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-4 border-2 ${
                errors.password ? 'border-red-500' : 'border-black'
              } focus:outline-none`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-lg text-left">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full p-4 border-2 ${
                errors.confirmPassword ? 'border-red-500' : 'border-black'
              } focus:outline-none`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="block text-lg text-left">
              Bio (optional)
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className={`w-full p-4 border-2 ${
                errors.bio ? 'border-red-500' : 'border-black'
              } focus:outline-none`}
              placeholder="Tell us a bit about yourself..."
              rows="3"
            />
            {errors.bio && (
              <p className="text-red-500 text-sm mt-1">{errors.bio}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-4 bg-primary-yellow border-2 border-black hover:bg-dark-yellow transition-colors text-xl disabled:opacity-70"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>

          <div className="text-center mt-4">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Log in here
              </Link>
            </p>
          </div>
        </form>
      </main>
    </div>
  );
};

export default RegisterPage;