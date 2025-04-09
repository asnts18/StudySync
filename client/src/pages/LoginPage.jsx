import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { validateForm, loginFormRules } from '../utils/validationUtils';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error: authError, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  // Check for message in location state (e.g., from registration)
  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
    }
  }, [location]);

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
    const { isValid, errors: validationErrors } = validateForm(formData, loginFormRules);
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      // Use login function from AuthContext
      await login(formData.email, formData.password);
      // Redirect will be handled in the login function
    } catch (err) {
      // Error handling is done in the AuthContext
      console.error('Login submission error:', err);
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
          <h1 className="text-4xl font-bold">log in</h1>
        </div>

        {/* Success message (e.g., after registration) */}
        {message && (
          <div className="mb-6 p-4 border-2 border-green-500 bg-green-100 text-green-700">
            {message}
          </div>
        )}

        {/* Error message */}
        {authError && (
          <div className="mb-6 p-4 border-2 border-red-500 bg-red-100 text-red-700">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-4 bg-primary-yellow border-2 border-black hover:bg-dark-yellow transition-colors text-xl disabled:opacity-70"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>

          <div className="text-center mt-4">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </form>
      </main>
    </div>
  );
};

export default LoginPage;