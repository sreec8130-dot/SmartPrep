import React, { useEffect, useState, useRef } from 'react';
import { getStudySessions, updateStudySession, deleteStudySession } from '../services/api';
import { IconClock, IconPlay, IconPause, IconCheck, IconTrash, IconCalendar } from '../components/Icons';

export default function StudySessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('today'); // 'today', 'upcoming', 'completed'

  // Interactive Simple Study Timer
  const [activeTimerSession, setActiveTimerSession] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerIntervalRef = useRef(null);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getStudySessions();
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err.message || 'Failed to load study sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // Timer interval handling
  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerRunning]);

  const startTimer = (session) => {
    setActiveTimerSession(session);
    setTimerSeconds(0);
    setTimerRunning(true);
  };

  const pauseTimer = () => {
    setTimerRunning(false);
  };

  const resumeTimer = () => {
    setTimerRunning(true);
  };

  const completeTimerSession = async () => {
    if (!activeTimerSession) return;
    setTimerRunning(false);

    const minutesStudied = Math.max(1, Math.round(timerSeconds / 60));

    try {
      await updateStudySession(activeTimerSession._id, {
        status: 'completed',
        actualMinutesStudied: minutesStudied,
        markTopicCompleted: true,
      });
      setActiveTimerSession(null);
      setTimerSeconds(0);
      await loadSessions();
      alert(`Great job! You logged ${minutesStudied} minutes for "${activeTimerSession.topic?.title || 'Study Session'}"!`);
    } catch (err) {
      alert(err.message || 'Error completing session');
    }
  };

  const handleToggleComplete = async (session) => {
    try {
      const newStatus = session.status === 'completed' ? 'pending' : 'completed';
      await updateStudySession(session._id, {
        status: newStatus,
        actualMinutesStudied: newStatus === 'completed' ? session.duration : 0,
        markTopicCompleted: newStatus === 'completed',
      });
      await loadSessions();
    } catch (err) {
      alert(err.message || 'Failed to update session');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this study session record?')) return;
    try {
      await deleteStudySession(id);
      await loadSessions();
    } catch (err) {
      alert(err.message || 'Failed to delete session');
    }
  };

  // Filter sessions into tabs
  const now = new Date();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const todaySessions = sessions.filter((s) => {
    const d = new Date(s.date);
    return d >= startOfToday && d <= endOfToday;
  });

  const upcomingSessions = sessions.filter((s) => {
    const d = new Date(s.date);
    return d > endOfToday && s.status !== 'completed';
  });

  const completedSessions = sessions.filter((s) => s.status === 'completed');

  const displayedSessions =
    tab === 'today' ? todaySessions : tab === 'upcoming' ? upcomingSessions : completedSessions;

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Study Session Tracker</h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Execute scheduled focus sessions, record actual study minutes, and mark syllabus topics completed.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Active Focus Session Timer Bar */}
      {activeTimerSession && (
        <div className="bg-teal-900 text-white rounded-2xl p-5 shadow-lg border border-teal-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-teal-800 flex items-center justify-center text-teal-200 shrink-0">
              <IconClock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
                Active Study Session
              </span>
              <h3 className="text-base font-bold text-white truncate">
                {activeTimerSession.topic?.title || 'Focused Study'}
              </h3>
              <p className="text-xs text-teal-300">
                {activeTimerSession.subject?.name} • Target: {activeTimerSession.duration} mins
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-center sm:self-auto">
            <div className="font-mono text-2xl font-black tracking-widest text-teal-100 bg-teal-950/70 px-4 py-1.5 rounded-xl border border-teal-800">
              {formatTimer(timerSeconds)}
            </div>

            {timerRunning ? (
              <button
                onClick={pauseTimer}
                className="px-3.5 py-2 bg-teal-800 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors"
              >
                <IconPause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={resumeTimer}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors"
              >
                <IconPlay className="w-4 h-4" />
                <span>Resume</span>
              </button>
            )}

            <button
              onClick={completeTimerSession}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1"
            >
              <IconCheck className="w-4 h-4" />
              <span>Finish & Log</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setTab('today')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            tab === 'today'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Today's Sessions ({todaySessions.length})
        </button>
        <button
          onClick={() => setTab('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            tab === 'upcoming'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Upcoming ({upcomingSessions.length})
        </button>
        <button
          onClick={() => setTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            tab === 'completed'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Completed History ({completedSessions.length})
        </button>
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <span className="ml-3 text-sm text-slate-500 font-medium">Loading sessions...</span>
        </div>
      ) : displayedSessions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-md mx-auto">
          <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <IconClock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {tab === 'today'
              ? 'No sessions scheduled for today.'
              : tab === 'upcoming'
              ? 'No upcoming sessions.'
              : 'No completed sessions logged yet.'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            {tab === 'today'
              ? 'Visit the Study Plan generator to populate your daily study queue.'
              : 'Complete sessions using the study timer to track your academic progress.'}
          </p>
          {tab === 'today' && (
            <a
              href="/study-plan"
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-teal-600 text-white hover:bg-teal-700"
            >
              <span>Go to Study Plan</span>
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayedSessions.map((session) => {
            const isCompleted = session.status === 'completed';
            const isTimerActive = activeTimerSession?._id === session._id;

            return (
              <div
                key={session._id}
                className={`bg-white rounded-xl border p-4 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                  isCompleted
                    ? 'border-slate-200 bg-slate-50/50'
                    : isTimerActive
                    ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                    : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-start space-x-3.5 min-w-0">
                  <button
                    onClick={() => handleToggleComplete(session)}
                    className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 hover:border-teal-600 bg-white text-transparent'
                    }`}
                    title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                  >
                    <IconCheck className="w-3.5 h-3.5" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-0.5">
                      <span className="text-xs font-bold text-teal-600 truncate">
                        {session.subject?.name || 'Subject'}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {new Date(session.date).toLocaleDateString()}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Est: {session.duration} mins
                      </span>
                      {session.actualMinutesStudied > 0 && (
                        <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                          Logged: {session.actualMinutesStudied}m
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-sm font-semibold truncate mt-0.5 ${
                        isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                      }`}
                    >
                      {session.topic?.title || 'Session Topic'}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                  {!isCompleted && !isTimerActive && (
                    <button
                      onClick={() => startTimer(session)}
                      className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-xs rounded-lg flex items-center space-x-1.5 transition-colors"
                    >
                      <IconPlay className="w-3.5 h-3.5" />
                      <span>Start Timer</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(session._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Delete session"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
