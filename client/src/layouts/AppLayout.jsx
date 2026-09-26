import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { logout, getUser } from '../utils/auth';
import {
  IconDashboard,
  IconBook,
  IconCalendar,
  IconSparkles,
  IconClock,
  IconChart,
  IconUser,
  IconLogout,
  IconMenu,
  IconClose,
} from '../components/Icons';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: IconDashboard },
  { name: 'Subjects', path: '/subjects', icon: IconBook },
  { name: 'Exams', path: '/exams', icon: IconCalendar },
  { name: 'Study Plan', path: '/study-plan', icon: IconSparkles },
  { name: 'Study Sessions', path: '/study-sessions', icon: IconClock },
  { name: 'Progress', path: '/progress', icon: IconChart },
  { name: 'Profile', path: '/profile', icon: IconUser },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentUser = getUser();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-2.5">
          <img
            src="/logo.png"
            alt="SmartPrep Logo"
            className="w-8 h-8 rounded-lg object-contain shadow-xs"
          />
          <span className="font-bold text-slate-900 text-base tracking-tight">SmartPrep</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <IconClose className="w-6 h-6" /> : <IconMenu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs flex">
          <div className="w-64 bg-white h-full flex flex-col p-4 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2.5">
                <img
                  src="/logo.png"
                  alt="SmartPrep Logo"
                  className="w-8 h-8 rounded-lg object-contain shadow-xs"
                />
                <span className="font-bold text-slate-900 text-base">SmartPrep</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-800"
              >
                <IconClose className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-teal-50 text-teal-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-100 mt-4">
              <div className="px-3 py-2 mb-2">
                <p className="text-xs font-semibold text-slate-800 truncate">{currentUser?.name || 'Student'}</p>
                <p className="text-xs text-slate-500 truncate">{currentUser?.email || ''}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3.5 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <IconLogout className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 min-h-screen sticky top-0 h-screen">
        {/* Brand */}
        <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
          <img
            src="/logo.png"
            alt="SmartPrep Logo"
            className="w-10 h-10 rounded-xl object-contain drop-shadow-xs"
          />
          <div>
            <span className="font-bold text-slate-900 text-lg tracking-tight block leading-tight">SmartPrep</span>
            <span className="text-[11px] font-medium text-teal-600 uppercase tracking-wider">Study Planner</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 font-semibold flex items-center justify-center text-sm">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {currentUser?.name || 'Student'}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {currentUser?.email || ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            id="sidebar-logout-btn"
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
          >
            <IconLogout className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Page Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
