import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardData, updateStudySession } from '../services/api';
import { getUser } from '../utils/auth';
import {
  IconBook,
  IconCalendar,
  IconClock,
  IconChart,
  IconCheck,
  IconSparkles,
  IconPlus,
} from '../components/Icons';

// Safe date formatter
function formatExamDateSafe(dateInput) {
  if (!dateInput) return '';
  const dateStr = String(dateInput).split('T')[0];
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dt = new Date(y, m, d);
    return dt.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  }
  return new Date(dateInput).toLocaleDateString();
}

function computeDaysRemaining(dateInput) {
  if (!dateInput) return 0;
  const dateStr = String(dateInput).split('T')[0];
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const targetDate = new Date(y, m, d);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffMs = targetDate - today;
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }
  return 0;
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingSessionId, setUpdatingSessionId] = useState(null);
  const user = getUser();

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getDashboardData();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleToggleSession = async (session) => {
    try {
      setUpdatingSessionId(session._id);
      const newStatus = session.status === 'completed' ? 'pending' : 'completed';
      await updateStudySession(session._id, {
        status: newStatus,
        actualMinutesStudied: newStatus === 'completed' ? session.duration : 0,
        markTopicCompleted: newStatus === 'completed',
      });
      await loadDashboard();
    } catch (err) {
      alert(err.message || 'Error updating session');
    } finally {
      setUpdatingSessionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-teal-600"></div>
        <span className="ml-3 text-sm text-slate-500 font-medium">Loading your dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm mb-6 flex items-center justify-between">
        <span>{error}</span>
        <button
          onClick={loadDashboard}
          className="text-xs bg-rose-600 text-white px-3 py-1.5 rounded-lg hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const {
    summary,
    todaySessions = [],
    overallProgress = 0,
    subjectProgress = [],
    upcomingExams = [],
  } = data || {};

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Here is your daily study timetable and academic exam preparation.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/study-plan"
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors shadow-xs shadow-teal-200"
          >
            <IconSparkles className="w-4 h-4" />
            <span>Generate Timetable</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Subjects</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <IconBook className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{summary?.totalSubjects || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Enrolled subjects</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Topics</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <IconChart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{summary?.totalTopics || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Across all subjects</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Completed</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <IconCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{summary?.completedTopics || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Topics mastered</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Exams</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <IconCalendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600">{summary?.upcomingExamsCount || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Upcoming exams</p>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Study Hours</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <IconClock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-600">{summary?.totalStudyHours || 0}h</div>
          <p className="text-xs text-slate-500 mt-1">Logged study time</p>
        </div>
      </div>

      {/* Main Grid: Today's Plan & Upcoming Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Scheduled Plan */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Today's Study Timetable</h2>
              <p className="text-xs text-slate-500">Scheduled study sessions for today</p>
            </div>
            <Link
              to="/study-sessions"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700"
            >
              Session tracker &rarr;
            </Link>
          </div>

          {todaySessions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-3">
                <IconSparkles className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">No study sessions for today</p>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                Generate a daily study timetable to stay ahead of your upcoming exam schedule.
              </p>
              <Link
                to="/study-plan"
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors"
              >
                <IconPlus className="w-3.5 h-3.5" />
                <span>Create Study Plan</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySessions.map((session) => {
                const isCompleted = session.status === 'completed';
                return (
                  <div
                    key={session._id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isCompleted
                        ? 'bg-slate-50/80 border-slate-200 opacity-75'
                        : 'bg-white border-slate-200 hover:border-teal-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <button
                        onClick={() => handleToggleSession(session)}
                        disabled={updatingSessionId === session._id}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 hover:border-teal-500 bg-white text-transparent'
                        }`}
                        title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                      >
                        <IconCheck className="w-3.5 h-3.5" />
                      </button>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          {session.startTime && (
                            <span className="text-[11px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                              {session.startTime} – {session.endTime}
                            </span>
                          )}
                          <span className="text-xs font-semibold text-slate-700 truncate">
                            {session.subject?.name || 'Subject'}
                          </span>
                        </div>
                        <p
                          className={`text-sm font-semibold truncate mt-0.5 ${
                            isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                          }`}
                        >
                          {session.partTitle || session.topic?.title || 'Topic Study'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-3">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {isCompleted ? 'Done' : 'Pending'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Exams Card (Clickable to /exams) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Upcoming Exams</h2>
              <p className="text-xs text-slate-500">Nearest exam milestones</p>
            </div>
            <Link to="/exams" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
              View all &rarr;
            </Link>
          </div>

          {upcomingExams.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-2">
                <IconCalendar className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700">No upcoming exams</p>
              <p className="text-[11px] text-slate-500 mt-0.5 mb-3">Add exam dates to prioritize your schedule.</p>
              <Link
                to="/exams"
                className="text-xs px-3 py-1.5 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700"
              >
                + Schedule Exam
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingExams.map((exam) => {
                const diffDays = computeDaysRemaining(exam.examDate);

                let badgeColor = 'bg-slate-100 text-slate-700';
                let badgeText = `${diffDays} days left`;
                if (diffDays <= 0) {
                  badgeColor = 'bg-rose-100 text-rose-700 font-bold';
                  badgeText = 'Today!';
                } else if (diffDays === 1) {
                  badgeColor = 'bg-amber-100 text-amber-800 font-bold';
                  badgeText = 'Tomorrow';
                } else if (diffDays <= 7) {
                  badgeColor = 'bg-teal-50 text-teal-700 font-medium';
                }

                return (
                  <Link
                    key={exam._id}
                    to="/exams"
                    className="block p-3 rounded-xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-2xs transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-teal-600 truncate">
                        {exam.subject?.name || 'Subject'}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${badgeColor}`}>
                        {badgeText}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">{exam.examName}</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {formatExamDateSafe(exam.examDate)}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Academic Progress Overview</h2>
            <p className="text-xs text-slate-500">Live syllabus completion across enrolled subjects</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-medium text-slate-500">Overall Completion:</span>
            <span className="text-sm font-extrabold text-teal-600">{overallProgress}%</span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-6">
          <div
            className="bg-teal-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, overallProgress))}%` }}
          />
        </div>

        {/* Subject-Wise Progress Grid */}
        {subjectProgress.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">
            No subjects enrolled yet.{' '}
            <Link to="/subjects" className="text-teal-600 font-semibold underline">
              Choose from academic library
            </Link>{' '}
            to start tracking progress.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectProgress.map((subj) => (
              <div
                key={subj.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800 truncate">{subj.name}</span>
                  <span className="text-xs font-semibold text-slate-600">{subj.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-1">
                  <div
                    className="bg-teal-600 h-full rounded-full"
                    style={{ width: `${subj.progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  {subj.completed} of {subj.total} topics completed
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
