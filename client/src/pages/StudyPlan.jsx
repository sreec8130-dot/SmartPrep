import React, { useEffect, useState } from 'react';
import {
  getSubjects,
  generateStudyPlan,
  getStudyPlans,
  getStudyPlanById,
  deleteStudyPlan,
  updateStudySession,
  deleteStudySession,
} from '../services/api';
import {
  IconSparkles,
  IconClock,
  IconCalendar,
  IconCheck,
  IconTrash,
  IconBook,
  IconPlus,
} from '../components/Icons';

export default function StudyPlan() {
  const [subjects, setSubjects] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Availability inputs
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('13:00');
  const [preferredDuration, setPreferredDuration] = useState('60');
  const [breakDuration, setBreakDuration] = useState('15');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [planTitle, setPlanTitle] = useState('My Academic Study Timetable');

  const [showConfigForm, setShowConfigForm] = useState(true);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      const [subjectsRes, plansRes] = await Promise.all([getSubjects(), getStudyPlans()]);
      setSubjects(subjectsRes.subjects || []);
      const userPlans = plansRes.plans || [];

      // Select all subjects by default
      if (subjectsRes.subjects?.length > 0) {
        setSelectedSubjects(subjectsRes.subjects.map((s) => s._id));
      }

      // Initialize dates: Today -> 14 days later
      const today = new Date();
      const twoWeeks = new Date();
      twoWeeks.setDate(today.getDate() + 14);

      setStartDate(today.toISOString().slice(0, 10));
      setEndDate(twoWeeks.toISOString().slice(0, 10));

      // Load active plan if exists
      const currentActive = userPlans.find((p) => p.status === 'active') || userPlans[0];
      if (currentActive) {
        await loadPlanDetails(currentActive._id);
        setShowConfigForm(false); // Hide form if an active plan already exists
      }
    } catch (err) {
      setError(err.message || 'Failed to load study plan data');
    } finally {
      setLoading(false);
    }
  };

  const loadPlanDetails = async (planId) => {
    try {
      const res = await getStudyPlanById(planId);
      setActivePlan(res.plan);
      setSessions(res.sessions || []);
    } catch (err) {
      console.error('Error fetching plan details:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSelectAllSubjects = () => {
    if (selectedSubjects.length === subjects.length) {
      setSelectedSubjects([]);
    } else {
      setSelectedSubjects(subjects.map((s) => s._id));
    }
  };

  const toggleSubjectSelect = (id) => {
    if (selectedSubjects.includes(id)) {
      setSelectedSubjects(selectedSubjects.filter((sId) => sId !== id));
    } else {
      setSelectedSubjects([...selectedSubjects, id]);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (selectedSubjects.length === 0) {
      alert('Please select at least one subject to generate a study timetable');
      return;
    }

    try {
      setGenerating(true);
      setError('');
      setSuccessMsg('');

      const res = await generateStudyPlan({
        subjects: selectedSubjects,
        startTime,
        endTime,
        preferredSessionDuration: Number(preferredDuration),
        breakDuration: Number(breakDuration),
        startDate,
        endDate,
        title: planTitle,
      });

      setSuccessMsg('New study timetable generated successfully and saved to MongoDB!');
      setActivePlan(res.plan);
      setSessions(res.sessions || []);
      setShowConfigForm(false);
    } catch (err) {
      setError(err.message || 'Failed to generate study timetable');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleSession = async (session) => {
    try {
      const newStatus = session.status === 'completed' ? 'pending' : 'completed';
      const updated = await updateStudySession(session._id, {
        status: newStatus,
        actualMinutesStudied: newStatus === 'completed' ? session.duration : 0,
        markTopicCompleted: newStatus === 'completed',
      });

      setSessions((prev) =>
        prev.map((s) => (s._id === session._id ? updated.session : s))
      );
    } catch (err) {
      alert(err.message || 'Failed to update session');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Delete this study session?')) return;
    try {
      await deleteStudySession(sessionId);
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
    } catch (err) {
      alert(err.message || 'Failed to delete session');
    }
  };

  const handleDeleteCurrentPlan = async () => {
    if (!activePlan) return;
    if (!window.confirm('Are you sure you want to delete this study plan timetable?')) return;

    try {
      await deleteStudyPlan(activePlan._id);
      setActivePlan(null);
      setSessions([]);
      setShowConfigForm(true);
    } catch (err) {
      alert(err.message || 'Failed to delete plan');
    }
  };

  // Group sessions by Date string safely
  const groupedSessions = sessions.reduce((acc, session) => {
    const rawDate = session.date ? String(session.date).split('T')[0] : '';
    let dateLabel = rawDate;
    if (rawDate) {
      const [y, m, d] = rawDate.split('-');
      const dObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      dateLabel = dObj.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }

    if (!acc[dateLabel]) acc[dateLabel] = [];
    acc[dateLabel].push(session);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <span className="ml-3 text-sm text-slate-500 font-medium">Loading study timetable...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Study Timetable Planner</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
              Exam Priority + Breaks
            </span>
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Generates an exact daily timetable with session start & end times, automatic rest breaks, and large topic splits.
          </p>
        </div>

        {activePlan && (
          <button
            onClick={() => setShowConfigForm(!showConfigForm)}
            className="px-4 py-2 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-xl text-xs font-bold transition-colors self-start sm:self-auto"
          >
            {showConfigForm ? 'Hide Timetable Settings' : 'Regenerate / Adjust Timetable'}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-900 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Timetable Configuration Form */}
      {showConfigForm && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-7">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <IconSparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {activePlan ? 'Regenerate Study Timetable' : 'Configure Study Availability'}
              </h2>
              <p className="text-xs text-slate-500">
                Define your exact daily study hours, session length, and rest breaks
              </p>
            </div>
          </div>

          {subjects.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-600 text-center">
              You haven't enrolled in any subjects yet. Please{' '}
              <a href="/subjects" className="text-teal-600 font-bold underline">
                select subjects from the academic library
              </a>{' '}
              first.
            </div>
          ) : (
            <form onSubmit={handleGenerate} className="space-y-5">
              {/* Subject Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Select Subjects to Schedule *
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllSubjects}
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                  >
                    {selectedSubjects.length === subjects.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {subjects.map((s) => {
                    const isSelected = selectedSubjects.includes(s._id);
                    return (
                      <button
                        type="button"
                        key={s._id}
                        onClick={() => toggleSubjectSelect(s._id)}
                        className={`px-3.5 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className="truncate">{s.name}</span>
                        {isSelected && <IconCheck className="w-4 h-4 text-teal-600 shrink-0 ml-1.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Exact Daily Timetable Window & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50/70 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Study Start Time (e.g. 09:00 AM) *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Study End Time (e.g. 01:00 PM) *
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Session Duration *
                  </label>
                  <select
                    value={preferredDuration}
                    onChange={(e) => setPreferredDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes (Standard)</option>
                    <option value="90">90 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rest Break Duration *
                  </label>
                  <select
                    value={breakDuration}
                    onChange={(e) => setBreakDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  >
                    <option value="0">No Breaks</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes (Recommended)</option>
                    <option value="20">20 minutes</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target End Date / Exam Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  * Sessions are scheduled strictly within your daily window ({startTime} to {endTime}) with rest breaks.
                </span>
                <button
                  type="submit"
                  disabled={generating}
                  id="generate-plan-btn"
                  className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors shadow-xs shadow-teal-200 disabled:opacity-50"
                >
                  <IconSparkles className="w-4 h-4" />
                  <span>{generating ? 'Generating Timetable...' : activePlan ? 'Regenerate Plan' : 'Generate Timetable'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Unscheduled Topics Warning Banner */}
      {activePlan && activePlan.unscheduledTopics && activePlan.unscheduledTopics.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 shadow-xs">
          <div className="flex items-start space-x-3">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-900">
                Study Time Shortfall Notice
              </h3>
              <p className="text-xs text-amber-800 mt-1">
                Your selected curriculum requires approximately{' '}
                <strong>{activePlan.totalRequiredHours} hours</strong>, but only{' '}
                <strong>{activePlan.totalAvailableHours} hours</strong> are available in your study window before the exam.
              </p>

              <div className="mt-3 pt-3 border-t border-amber-200/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block mb-1.5">
                  Remaining Unscheduled Topics ({activePlan.unscheduledTopics.length}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {activePlan.unscheduledTopics.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-white/80 border border-amber-300 rounded-lg text-xs text-amber-900 font-medium"
                    >
                      {item.title} ({item.subjectName}) — {(item.remainingMinutes / 60).toFixed(1)}h
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-amber-700 mt-2">
                  Tip: Increase your daily study window or push back the end date to schedule all topics.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timetable Schedule Display */}
      {activePlan ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 mb-6">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-900">{activePlan.title}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  Daily Window: {activePlan.startTime || '09:00'} – {activePlan.endTime || '13:00'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {sessions.filter((s) => s.status === 'completed').length} of {sessions.length} sessions completed
              </p>
            </div>

            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <button
                onClick={() => setShowConfigForm(true)}
                className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                Regenerate Plan
              </button>
              <button
                onClick={handleDeleteCurrentPlan}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold p-1.5 hover:bg-rose-50 rounded-lg transition-colors flex items-center space-x-1"
                title="Delete Plan"
              >
                <IconTrash className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grouped Timetable by Date */}
          {Object.keys(groupedSessions).length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">
              No sessions scheduled.
            </p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSessions).map(([dateStr, daySessions]) => {
                const completedCount = daySessions.filter((s) => s.status === 'completed').length;
                return (
                  <div key={dateStr} className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                      <div className="flex items-center space-x-2">
                        <IconCalendar className="w-4 h-4 text-teal-600" />
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          {dateStr}
                        </h4>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {completedCount} / {daySessions.length} Completed
                      </span>
                    </div>

                    {/* Timeline items with breaks */}
                    <div className="space-y-2.5">
                      {daySessions.map((session, sIdx) => {
                        const isDone = session.status === 'completed';
                        const nextSession = daySessions[sIdx + 1];

                        return (
                          <React.Fragment key={session._id}>
                            <div
                              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                                isDone
                                  ? 'bg-slate-100/80 border-slate-200 opacity-75'
                                  : 'bg-white border-slate-200 hover:border-teal-300 shadow-2xs'
                              }`}
                            >
                              <div className="flex items-center space-x-3.5 min-w-0">
                                <button
                                  onClick={() => handleToggleSession(session)}
                                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                                    isDone
                                      ? 'bg-emerald-500 border-emerald-500 text-white'
                                      : 'border-slate-300 hover:border-teal-600 bg-white text-transparent'
                                  }`}
                                  title={isDone ? 'Mark pending' : 'Mark completed'}
                                >
                                  <IconCheck className="w-3.5 h-3.5" />
                                </button>

                                <div className="min-w-0">
                                  <div className="flex items-center space-x-2 flex-wrap gap-y-0.5">
                                    <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">
                                      {session.startTime} – {session.endTime}
                                    </span>
                                    <span className="text-xs font-bold text-slate-700 truncate">
                                      {session.subject?.name || 'Subject'}
                                    </span>
                                    {session.isRevision && (
                                      <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                                        Revision
                                      </span>
                                    )}
                                  </div>

                                  <p
                                    className={`text-sm font-semibold truncate mt-1 ${
                                      isDone ? 'line-through text-slate-500' : 'text-slate-900'
                                    }`}
                                  >
                                    {session.partTitle || session.topic?.title || 'Study Session'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 ml-2 shrink-0">
                                <span
                                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                    isDone
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}
                                >
                                  {isDone ? 'Completed' : 'Pending'}
                                </span>
                                <button
                                  onClick={() => handleDeleteSession(session._id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                                  title="Delete session"
                                >
                                  <IconTrash className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Render automatic break between sessions if interval exists */}
                            {nextSession && nextSession.startTime !== session.endTime && (
                              <div className="flex items-center justify-center my-1">
                                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-50/70 border border-dashed border-amber-200 rounded-lg text-[11px] text-amber-800 font-medium">
                                  <span>☕</span>
                                  <span>
                                    {session.endTime} – {nextSession.startTime} (Break)
                                  </span>
                                </div>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center max-w-md mx-auto">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <IconSparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Create your personalized study timetable.</h3>
          <p className="text-xs text-slate-500 mt-1">
            Choose your daily study window (e.g. 09:00 AM to 01:00 PM) to generate an exact schedule.
          </p>
        </div>
      )}
    </div>
  );
}
