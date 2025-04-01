import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    bio: '',
    university_id: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    // Simulate registration process
    console.log('Registration submitted:', formData);
    
    // For demo purposes only - normally would handle API call here
    setTimeout(() => {
      setIsLoading(false);
      
      // Redirect to login page after successful registration (for demo)
      navigate('/login', { 
        state: { message: 'Registration successful! Please log in.' }
      });
      
      // Uncomment to simulate an error
      // setError('Email already in use');
    }, 1000);
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

        {error && (
          <div className="mb-6 p-4 border-2 border-red-500 bg-red-100 text-red-700">
            {error}
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
                className="w-full p-4 border-2 border-black focus:outline-none"
                placeholder="Jane"
              />
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
                className="w-full p-4 border-2 border-black focus:outline-none"
                placeholder="Doe"
              />
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
              className="w-full p-4 border-2 border-black focus:outline-none"
              placeholder="your@email.com"
            />
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
              <option value="6">Columbia University</option>
              <option value="10">Cornell University</option>
              <option value="1">Harvard University</option>
              <option value="3">MIT</option>
              <option value="5">Princeton University</option>
              <option value="2">Stanford University</option>
              <option value="7">University of California, Berkeley</option>
              <option value="8">University of Chicago</option>
              <option value="9">University of Michigan</option>
              <option value="4">Yale University</option>
            </select>
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
              className="w-full p-4 border-2 border-black focus:outline-none"
              placeholder="••••••••"
            />
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
              className="w-full p-4 border-2 border-black focus:outline-none"
              placeholder="••••••••"
            />
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
              className="w-full p-4 border-2 border-black focus:outline-none"
              placeholder="Tell us a bit about yourself..."
              rows="3"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-4 bg-primary-yellow border-2 border-black hover:bg-dark-yellow transition-colors text-xl disabled:opacity-70"
          >
            {isLoading ? 'Creating account...' : 'Register'}
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