import React, { useEffect, useState } from 'react';
import { getExams, getSubjects, createExam, updateExam, deleteExam } from '../services/api';
import { IconPlus, IconEdit, IconTrash, IconCalendar, IconClose } from '../components/Icons';

// Timezone-safe helper: parses "YYYY-MM-DD" or Date object into localized string without day-shift
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
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return new Date(dateInput).toLocaleDateString();
}

// Helper to compute exact days remaining without timezone distortion
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

export default function Exams() {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formSubject, setFormSubject] = useState('');
  const [formExamName, setFormExamName] = useState('');
  const [formExamDate, setFormExamDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Tab or view for Past Exams
  const [showPastExams, setShowPastExams] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [examsRes, subjectsRes] = await Promise.all([getExams(), getSubjects()]);
      setExams(examsRes.exams || []);
      setSubjects(subjectsRes.subjects || []);
    } catch (err) {
      setError(err.message || 'Failed to load exams data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingExam(null);
    setFormSubject(subjects.length > 0 ? subjects[0]._id : '');
    setFormExamName('');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);
    setFormExamDate(tomorrow.toISOString().slice(0, 10));
    setModalOpen(true);
  };

  const openEditModal = (exam) => {
    setEditingExam(exam);
    setFormSubject(exam.subject?._id || exam.subject || '');
    setFormExamName(exam.examName || '');
    setFormExamDate(exam.examDate ? String(exam.examDate).split('T')[0] : '');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formSubject) {
      alert('Please select a subject');
      return;
    }
    if (!formExamName.trim()) {
      alert('Exam name is required');
      return;
    }
    if (!formExamDate) {
      alert('Exam date is required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingExam) {
        await updateExam(editingExam._id, {
          subject: formSubject,
          examName: formExamName,
          examDate: formExamDate,
        });
      } else {
        await createExam({
          subject: formSubject,
          examName: formExamName,
          examDate: formExamDate,
        });
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err.message || 'Error saving exam');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExam = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteExam(id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Error deleting exam');
    }
  };

  // Separate Upcoming Exams (>= 0 days remaining) from Past Exams (< 0 days)
  const upcomingExams = exams.filter((e) => computeDaysRemaining(e.examDate) >= 0);
  const pastExams = exams.filter((e) => computeDaysRemaining(e.examDate) < 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Exams & Deadlines</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Real exams stored in MongoDB. The SmartPrep scheduling engine uses these to prioritize topics.
          </p>
        </div>
        <button
          onClick={openAddModal}
          id="add-exam-btn"
          disabled={subjects.length === 0}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors shadow-xs shadow-teal-200 disabled:opacity-50 self-start sm:self-auto"
        >
          <IconPlus className="w-4 h-4" />
          <span>Add Exam</span>
        </button>
      </div>

      {subjects.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs flex items-center justify-between">
          <span>You need to add at least one subject before scheduling an exam.</span>
          <a href="/subjects" className="font-bold underline ml-2">Add Subjects &rarr;</a>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <span className="ml-3 text-sm text-slate-500 font-medium">Loading exams...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section 1: Upcoming Exams */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span>Upcoming Exams</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold border border-teal-200">
                  {upcomingExams.length}
                </span>
              </h2>
            </div>

            {upcomingExams.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center max-w-lg mx-auto">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <IconCalendar className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">No upcoming exams.</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Add exam dates to prioritize your revision schedule and boost focus.
                </p>
                {subjects.length > 0 && (
                  <button
                    onClick={openAddModal}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors"
                  >
                    <IconPlus className="w-4 h-4" />
                    <span>Schedule An Exam</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingExams.map((exam) => {
                  const days = computeDaysRemaining(exam.examDate);

                  let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
                  let label = `${days} days remaining`;
                  if (days === 0) {
                    badgeColor = 'bg-rose-100 text-rose-700 font-bold border-rose-300 animate-pulse';
                    label = 'Exam Today!';
                  } else if (days === 1) {
                    badgeColor = 'bg-amber-100 text-amber-800 font-bold border-amber-300';
                    label = 'Tomorrow';
                  } else if (days <= 7) {
                    badgeColor = 'bg-teal-50 text-teal-700 font-semibold border-teal-200';
                    label = `${days} days left`;
                  }

                  return (
                    <div
                      key={exam._id}
                      className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-teal-600 uppercase tracking-wider truncate">
                            {exam.subject?.name || 'Subject'}
                          </span>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                            {label}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 truncate">
                          {exam.examName}
                        </h3>

                        <div className="flex items-center space-x-2 text-xs text-slate-600 mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <IconCalendar className="w-4 h-4 text-teal-500 shrink-0" />
                          <span className="font-medium">
                            {formatExamDateSafe(exam.examDate)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-1 pt-4 border-t border-slate-100 mt-4">
                        <button
                          onClick={() => openEditModal(exam)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg text-xs"
                          title="Edit Exam"
                        >
                          <IconEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam._id, exam.examName)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
                          title="Delete Exam"
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

          {/* Section 2: Past Exams (Separated) */}
          {pastExams.length > 0 && (
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setShowPastExams(!showPastExams)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center space-x-1.5"
                >
                  <span>{showPastExams ? '▼' : '►'}</span>
                  <span>Past Exams History ({pastExams.length})</span>
                </button>
              </div>

              {showPastExams && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastExams.map((exam) => (
                    <div
                      key={exam._id}
                      className="bg-slate-50/70 rounded-2xl border border-slate-200 p-4 opacity-75 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-slate-500 truncate">
                            {exam.subject?.name || 'Subject'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-600">
                            Completed
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 line-through">
                          {exam.examName}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatExamDateSafe(exam.examDate)}
                        </p>
                      </div>

                      <div className="flex justify-end pt-2 mt-2">
                        <button
                          onClick={() => handleDeleteExam(exam._id, exam.examName)}
                          className="text-xs text-slate-400 hover:text-rose-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Exam Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingExam ? 'Edit Exam' : 'Schedule New Exam'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <IconClose className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject *
                </label>
                <select
                  required
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                >
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Exam Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End Semester Examination"
                  value={formExamName}
                  onChange={(e) => setFormExamName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Exam Date *
                </label>
                <input
                  type="date"
                  required
                  value={formExamDate}
                  onChange={(e) => setFormExamDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingExam ? 'Update Exam' : 'Schedule Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
