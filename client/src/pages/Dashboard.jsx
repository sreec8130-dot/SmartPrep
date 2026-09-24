import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getUser } from '../utils/auth';
import { getCurrentUser } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getUser());

  useEffect(() => {
    // Optionally fetch /api/auth/me to verify token with backend
    const verifyUser = async () => {
      try {
        const data = await getCurrentUser();
        if (data && data.user) {
          setCurrentUser(data.user);
        }
      } catch (err) {
        // If token expired or invalid, log out
        logout();
        navigate('/login', { replace: true });
      }
    };

    verifyUser();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Minimal Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-lg">
            S
          </div>
          <span className="font-bold text-slate-900 text-lg">SmartPrep</span>
        </div>
        <button
          onClick={handleLogout}
          id="logout-btn"
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          Logout
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-semibold">
            🎓
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            SmartPrep Dashboard
          </h1>
          <p className="text-slate-600 text-sm mb-6">
            Authentication successfully verified. Welcome back
            {currentUser?.name ? `, ${currentUser.name}` : ''}!
          </p>

          {currentUser && (
            <div className="bg-slate-50 rounded-xl p-4 text-left border border-slate-100 text-xs text-slate-600 space-y-1">
              <div>
                <span className="font-medium text-slate-700">Name: </span>
                {currentUser.name}
              </div>
              <div>
                <span className="font-medium text-slate-700">Email: </span>
                {currentUser.email}
              </div>
              {currentUser.id && (
                <div>
                  <span className="font-medium text-slate-700">User ID: </span>
                  {currentUser.id}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
