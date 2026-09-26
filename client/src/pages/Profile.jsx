import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../services/api';
import { logout } from '../utils/auth';
import { IconUser, IconLogout, IconBook, IconCheck, IconClock } from '../components/Icons';

export default function Profile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await getProfile();
      setProfileData(res);
      setName(res.user?.name || '');
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFeedback({ type: 'error', message: 'Name cannot be empty' });
      return;
    }

    try {
      setSaving(true);
      setFeedback({ type: '', message: '' });
      const res = await updateProfile({ name: name.trim() });
      setProfileData((prev) => ({ ...prev, user: res.user }));

      // Also update stored user in localStorage
      const userStr = localStorage.getItem('smartprep_user');
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          parsed.name = res.user.name;
          localStorage.setItem('smartprep_user', JSON.stringify(parsed));
        } catch {
          // ignore
        }
      }

      setFeedback({ type: 'success', message: 'Profile name updated successfully!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error updating profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <span className="ml-3 text-sm text-slate-500 font-medium">Loading profile...</span>
      </div>
    );
  }

  const { user, stats = { totalSubjects: 0, completedTopics: 0, completedSessions: 0 } } = profileData || {};

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Profile</h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Manage your personal account details and review your SmartPrep achievements.
        </p>
      </div>

      {feedback.message && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Account Info & Name Update Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-sm shadow-teal-200">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : '2026'}
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdateName} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 max-w-md"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address (Read-only)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed max-w-md"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors shadow-xs shadow-teal-200 disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* SmartPrep Journey Statistics */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">SmartPrep Milestones</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-2xl font-bold text-teal-600">{stats.totalSubjects}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Subjects Created</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-2xl font-bold text-emerald-600">{stats.completedTopics}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Topics Mastered</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-2xl font-bold text-purple-600">{stats.completedSessions}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Sessions Completed</div>
          </div>
        </div>
      </div>

      {/* Security & Logout Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Sign Out</h4>
          <p className="text-xs text-slate-500 mt-0.5">End your current SmartPrep session securely.</p>
        </div>
        <button
          onClick={handleLogout}
          id="profile-logout-btn"
          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5"
        >
          <IconLogout className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
