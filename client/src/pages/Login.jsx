import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login as loginApi } from '../services/api';
import { login as setAuthSession } from '../utils/auth';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const successMessage = location.state?.message || '';

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Required-field validation
    if (!email.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const data = await loginApi({
        email: email.trim(),
        password,
      });

      // On successful login, store the JWT token in localStorage
      setAuthSession(data.token, data.user);

      // Redirect to /dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      {/* Top Navigation: Return to Landing Page */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors gap-1.5 py-1 px-2.5 rounded-lg hover:bg-slate-100"
        >
          <span>←</span> Back to Home
        </Link>
        <span className="text-xs text-slate-400 font-medium">SmartPrep Portal</span>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-8 animate-fade-in-up">
        {/* Brand / Logo Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center mb-3">
            <img
              src="/logo.png"
              alt="SmartPrep Logo"
              className="w-14 h-14 rounded-2xl object-contain drop-shadow-xs transition-transform duration-300 hover:scale-105"
            />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sign In to SmartPrep
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Sign in to continue your study preparation
          </p>
        </div>

        {/* Success message alert from registration */}
        {successMessage && !error && (
          <div
            id="login-success-banner"
            className="mb-6 p-3 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center animate-fade-in"
            role="status"
          >
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error message alert */}
        {error && (
          <div
            id="login-error"
            className="mb-6 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-center animate-fade-in"
            role="alert"
          >
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            id="login-submit-btn"
            className="w-full mt-2 py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Link to Register */}
        <div className="text-center mt-6 pt-5 border-t border-slate-100">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-teal-600 hover:text-teal-500 transition-colors"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
