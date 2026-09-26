import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProgressData } from '../services/api';
import { IconChart, IconClock, IconFlame, IconCheck, IconBook } from '../components/Icons';

export default function Progress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProgress = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getProgressData();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <span className="ml-3 text-sm text-slate-500 font-medium">Calculating academic progress...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
        {error}
      </div>
    );
  }

  const { overallProgress = { totalTopics: 0, completedTopics: 0, percent: 0 }, subjectProgress = [], stats = { totalStudyHours: 0, completedSessions: 0, pendingSessions: 0, currentStreak: 0 } } = data || {};

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Analytics & Progress</h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Real-time tracking of curriculum completion, study hour dedication, and revision consistency.
        </p>
      </div>

      {/* Global Progress Overview Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Total Curriculum Completion
            </span>
            <div className="flex items-baseline space-x-3 mt-1">
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {overallProgress.percent}%
              </span>
              <span className="text-sm text-slate-500 font-medium">
                ({overallProgress.completedTopics} of {overallProgress.totalTopics} Topics Completed)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 max-w-lg">
              Overall completion is calculated based on completed topics across all your registered subjects.
            </p>
          </div>

          {/* Large Visual Progress Meter */}
          <div className="w-full md:w-72">
            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
              <div
                className="bg-teal-600 h-full rounded-full transition-all duration-700 shadow-xs"
                style={{ width: `${Math.min(100, Math.max(0, overallProgress.percent))}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 mt-1.5 font-medium">
              <span>0% Start</span>
              <span>100% Target</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Study Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Hours */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Study Time</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <IconClock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.totalStudyHours}h</div>
          <p className="text-xs text-slate-500 mt-1">Logged study hours</p>
        </div>

        {/* Study Streak */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Daily Streak</span>
            <div className="p-2 bg-amber-50 text-amber-500 rounded-xl">
              <IconFlame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-600">{stats.currentStreak} Days</div>
          <p className="text-xs text-slate-500 mt-1">Consecutive study days</p>
        </div>

        {/* Completed Sessions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed Sessions</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <IconCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-600">{stats.completedSessions}</div>
          <p className="text-xs text-slate-500 mt-1">Sessions finished</p>
        </div>

        {/* Pending Sessions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Queue</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <IconChart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-sky-600">{stats.pendingSessions}</div>
          <p className="text-xs text-slate-500 mt-1">Scheduled sessions left</p>
        </div>
      </div>

      {/* Subject-Wise Progress Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Subject Breakdown</h2>
            <p className="text-xs text-slate-500">Individual progress for each course syllabus</p>
          </div>
          <Link
            to="/subjects"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700"
          >
            Manage Subjects &rarr;
          </Link>
        </div>

        {subjectProgress.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No subjects created yet. Add subjects to view individual progress breakdowns.
          </div>
        ) : (
          <div className="space-y-5">
            {subjectProgress.map((sub) => (
              <div key={sub.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-900">{sub.name}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="text-slate-500">
                      {sub.completedTopics} of {sub.totalTopics} Topics
                    </span>
                    <span className="font-extrabold text-teal-600 text-sm">
                      {sub.progressPercent}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${sub.progressPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
