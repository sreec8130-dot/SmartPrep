import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getSubjects,
  getPredefinedSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../services/api';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconBook,
  IconCalendar,
  IconClose,
  IconCheck,
} from '../components/Icons';

const colorThemes = [
  { key: 'indigo', label: 'Indigo', bg: 'bg-teal-500', text: 'text-teal-600', light: 'bg-teal-50' },
  { key: 'emerald', label: 'Emerald', bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50' },
  { key: 'amber', label: 'Amber', bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50' },
  { key: 'rose', label: 'Rose', bg: 'bg-rose-500', text: 'text-rose-600', light: 'bg-rose-50' },
  { key: 'sky', label: 'Sky Blue', bg: 'bg-sky-500', text: 'text-sky-600', light: 'bg-sky-50' },
  { key: 'purple', label: 'Purple', bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-50' },
];

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [predefinedLibrary, setPredefinedLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add/Edit Subject Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  // Form states
  const [selectedPredefinedId, setSelectedPredefinedId] = useState('');
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formExamDate, setFormExamDate] = useState('');
  const [formColor, setFormColor] = useState('indigo');

  // Predefined & Custom topics to be added with the subject
  const [modalTopics, setModalTopics] = useState([]);
  const [customTopicTitle, setCustomTopicTitle] = useState('');
  const [customTopicDifficulty, setCustomTopicDifficulty] = useState('Medium');
  const [customTopicMinutes, setCustomTopicMinutes] = useState('60');
  const [showAddCustomRow, setShowAddCustomRow] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [subsRes, predefRes] = await Promise.all([
        getSubjects(),
        getPredefinedSubjects(),
      ]);
      setSubjects(subsRes.subjects || []);
      setPredefinedLibrary(predefRes.predefinedSubjects || []);
    } catch (err) {
      setError(err.message || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingSubject(null);
    setSelectedPredefinedId('');
    setFormName('');
    setFormDesc('');
    setFormExamDate('');
    setFormColor('indigo');
    setModalTopics([]);
    setShowAddCustomRow(false);
    setModalOpen(true);
  };

  const handleSelectPredefined = (predef) => {
    if (!predef) {
      setSelectedPredefinedId('custom');
      setFormName('');
      setFormDesc('');
      setFormColor('indigo');
      setModalTopics([]);
      return;
    }

    setSelectedPredefinedId(predef.id);
    setFormName(predef.name);
    setFormDesc(predef.description);
    setFormColor(predef.color || 'indigo');

    // Pre-populate topics as all selected by default
    const topicsWithSelection = (predef.topics || []).map((t) => ({
      title: t.title,
      difficulty: t.difficulty || 'Medium',
      estimatedStudyMinutes: t.estimatedStudyMinutes || 60,
      priority: t.priority || 'Medium',
      selected: true,
    }));
    setModalTopics(topicsWithSelection);
  };

  const toggleTopicSelection = (index) => {
    setModalTopics((prev) =>
      prev.map((t, i) => (i === index ? { ...t, selected: !t.selected } : t))
    );
  };

  const updateTopicField = (index, field, value) => {
    setModalTopics((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    );
  };

  const handleAddCustomTopicToModal = (e) => {
    e.preventDefault();
    if (!customTopicTitle.trim()) {
      alert('Please enter a topic title');
      return;
    }

    setModalTopics((prev) => [
      ...prev,
      {
        title: customTopicTitle.trim(),
        difficulty: customTopicDifficulty,
        estimatedStudyMinutes: parseInt(customTopicMinutes, 10) || 60,
        priority: 'Medium',
        selected: true,
      },
    ]);

    setCustomTopicTitle('');
    setCustomTopicDifficulty('Medium');
    setCustomTopicMinutes('60');
    setShowAddCustomRow(false);
  };

  const openEditModal = (subject) => {
    setEditingSubject(subject);
    setSelectedPredefinedId('');
    setFormName(subject.name || '');
    setFormDesc(subject.description || '');
    setFormExamDate(subject.examDate ? subject.examDate.slice(0, 10) : '');
    setFormColor(subject.color || 'indigo');
    setModalTopics([]);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Subject name is required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingSubject) {
        await updateSubject(editingSubject._id, {
          name: formName,
          description: formDesc,
          examDate: formExamDate || null,
          color: formColor,
        });
      } else {
        // Collect selected topics
        const selectedTopics = modalTopics.filter((t) => t.selected);
        await createSubject({
          name: formName,
          description: formDesc,
          examDate: formExamDate || null,
          color: formColor,
          topics: selectedTopics,
        });
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err.message || 'Error saving subject');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubject = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${name}"? This will delete all its topics and exams.`
      )
    ) {
      return;
    }

    try {
      await deleteSubject(id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Error deleting subject');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Subjects</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Choose from the predefined academic curriculum library or create custom subjects.
          </p>
        </div>
        <button
          onClick={openAddModal}
          id="add-subject-btn"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors shadow-xs shadow-teal-200 self-start sm:self-auto"
        >
          <IconPlus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <span className="ml-3 text-sm text-slate-500 font-medium">Loading your subjects...</span>
        </div>
      ) : subjects.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <IconBook className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">You haven't enrolled in any subjects yet.</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Choose from our pre-installed academic library (Data Structures, DBMS, Operating Systems, Networks, etc.) or add your own.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors"
          >
            <IconPlus className="w-4 h-4" />
            <span>Choose Your First Subject</span>
          </button>
        </div>
      ) : (
        /* Subjects Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((subject) => {
            const theme = colorThemes.find((c) => c.key === subject.color) || colorThemes[0];
            return (
              <div
                key={subject._id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Color Accent Bar */}
                <div className={`h-2 w-full ${theme.bg}`} />

                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${theme.light} ${theme.text}`}>
                        Subject
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-1 truncate">
                        {subject.name}
                      </h3>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => openEditModal(subject)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Subject"
                      >
                        <IconEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubject(subject._id, subject.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Subject"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {subject.description ? (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                      {subject.description}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 italic mt-2">No description provided</p>
                  )}

                  {/* Exam Date pill */}
                  {subject.examDate && (
                    <div className="flex items-center space-x-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg mt-3 w-fit border border-amber-200">
                      <IconCalendar className="w-3.5 h-3.5" />
                      <span className="font-medium">
                        Exam: {new Date(subject.examDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* Progress info */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-slate-600">
                        {subject.completedTopics || 0} / {subject.totalTopics || 0} Topics
                      </span>
                      <span className="font-bold text-slate-900">{subject.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${theme.bg}`}
                        style={{ width: `${subject.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {subject.totalTopics || 0} topics registered
                  </span>
                  <Link
                    to={`/subjects/${subject._id}`}
                    className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
                  >
                    <span>Manage Topics</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Choose Subject Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 shrink-0">
              <h3 className="text-base font-bold text-slate-900">
                {editingSubject ? 'Edit Subject' : 'Choose Your Subject'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <IconClose className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5 overflow-y-auto pr-1 flex-1">
              {!editingSubject && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Choose from Predefined Academic Library
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {predefinedLibrary.map((predef) => {
                      const isSelected = selectedPredefinedId === predef.id;
                      return (
                        <button
                          type="button"
                          key={predef.id}
                          onClick={() => handleSelectPredefined(predef)}
                          className={`p-2.5 text-left rounded-xl border text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{predef.name}</span>
                            {isSelected && <IconCheck className="w-3.5 h-3.5 text-teal-600 shrink-0 ml-1" />}
                          </div>
                          <span className="text-[10px] text-slate-400 font-normal block mt-1">
                            {predef.topics?.length || 0} topics
                          </span>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => handleSelectPredefined(null)}
                      className={`p-2.5 text-left rounded-xl border text-xs font-semibold transition-all ${
                        selectedPredefinedId === 'custom'
                          ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <span>+ Custom Subject</span>
                      <span className="text-[10px] text-slate-400 font-normal block mt-1">
                        Enter manually
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Subject Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Data Structures"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Exam Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formExamDate}
                    onChange={(e) => setFormExamDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Subject details or course syllabus notes"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              {/* Topic Selection for New Subjects */}
              {!editingSubject && modalTopics.length > 0 && (
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Select Topics to Include ({modalTopics.filter((t) => t.selected).length}/{modalTopics.length})
                      </span>
                      <p className="text-[11px] text-slate-500">Uncheck topics you do not need to study</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddCustomRow(!showAddCustomRow)}
                      className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
                    >
                      <IconPlus className="w-3.5 h-3.5" />
                      <span>Add Custom Topic</span>
                    </button>
                  </div>

                  {/* Add Custom Topic Row */}
                  {showAddCustomRow && (
                    <div className="p-3 bg-white border border-teal-200 rounded-xl shadow-xs space-y-2">
                      <span className="text-xs font-bold text-teal-900 block">Add Custom Topic</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Topic title"
                          value={customTopicTitle}
                          onChange={(e) => setCustomTopicTitle(e.target.value)}
                          className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-teal-600"
                        />
                        <select
                          value={customTopicDifficulty}
                          onChange={(e) => setCustomTopicDifficulty(e.target.value)}
                          className="px-2 py-1.5 text-xs rounded-lg border border-slate-300"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                        <input
                          type="number"
                          placeholder="Est. Minutes (e.g. 60)"
                          value={customTopicMinutes}
                          onChange={(e) => setCustomTopicMinutes(e.target.value)}
                          className="px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowAddCustomRow(false)}
                          className="text-xs text-slate-500 px-2 py-1"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddCustomTopicToModal}
                          className="text-xs bg-teal-600 text-white font-semibold px-3 py-1 rounded-lg"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Topics List with Checkboxes & Default Information */}
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                    {modalTopics.map((topic, idx) => {
                      return (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                            topic.selected
                              ? 'bg-white border-slate-200 shadow-2xs'
                              : 'bg-slate-100/60 border-slate-200/60 opacity-60'
                          }`}
                        >
                          <label className="flex items-center space-x-3 cursor-pointer min-w-0 flex-1">
                            <input
                              type="checkbox"
                              checked={topic.selected}
                              onChange={() => toggleTopicSelection(idx)}
                              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                            />
                            <span className="text-xs font-semibold text-slate-900 truncate">
                              {topic.title}
                            </span>
                          </label>

                          <div className="flex items-center space-x-2 shrink-0">
                            <select
                              value={topic.difficulty}
                              onChange={(e) => updateTopicField(idx, 'difficulty', e.target.value)}
                              className="text-[11px] font-medium px-2 py-1 rounded-md border border-slate-200 bg-white"
                            >
                              <option value="Easy">Easy</option>
                              <option value="Medium">Medium</option>
                              <option value="Hard">Hard</option>
                            </select>

                            <div className="flex items-center space-x-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                              <span>{topic.estimatedStudyMinutes}m</span>
                            </div>

                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                topic.priority === 'High'
                                  ? 'bg-rose-100 text-rose-700'
                                  : topic.priority === 'Low'
                                  ? 'bg-slate-100 text-slate-600'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {topic.priority}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Color Tag Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Color Tag
                </label>
                <div className="flex items-center space-x-2">
                  {colorThemes.map((c) => (
                    <button
                      type="button"
                      key={c.key}
                      onClick={() => setFormColor(c.key)}
                      className={`w-7 h-7 rounded-full ${c.bg} transition-all ${
                        formColor === c.key ? 'ring-2 ring-offset-2 ring-teal-600 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 mt-6 shrink-0">
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
                  {submitting
                    ? 'Adding to MongoDB...'
                    : editingSubject
                    ? 'Update Subject'
                    : 'Add Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
