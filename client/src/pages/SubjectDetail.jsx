import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getSubjectById, createTopic, updateTopic, deleteTopic } from '../services/api';
import { IconPlus, IconEdit, IconTrash, IconCheck, IconClock, IconClose } from '../components/Icons';

export default function SubjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter tabs: 'all', 'incomplete', 'completed'
  const [filter, setFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDifficulty, setFormDifficulty] = useState('Medium');
  const [formHours, setFormHours] = useState('1');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getSubjectById(id);
      setSubject(data.subject);
      setTopics(data.subject.topics || []);
    } catch (err) {
      setError(err.message || 'Failed to load subject topics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const openAddModal = () => {
    setEditingTopic(null);
    setFormTitle('');
    setFormDesc('');
    setFormDifficulty('Medium');
    setFormHours('1');
    setModalOpen(true);
  };

  const openEditModal = (topic) => {
    setEditingTopic(topic);
    setFormTitle(topic.title || '');
    setFormDesc(topic.description || '');
    setFormDifficulty(topic.difficulty || 'Medium');
    setFormHours(topic.estimatedHours ? topic.estimatedHours.toString() : '1');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Topic title is required');
      return;
    }
    const hours = parseFloat(formHours);
    if (isNaN(hours) || hours <= 0) {
      alert('Estimated hours must be greater than 0');
      return;
    }

    try {
      setSubmitting(true);
      if (editingTopic) {
        await updateTopic(editingTopic._id, {
          title: formTitle,
          description: formDesc,
          difficulty: formDifficulty,
          estimatedHours: hours,
        });
      } else {
        await createTopic(id, {
          title: formTitle,
          description: formDesc,
          difficulty: formDifficulty,
          estimatedHours: hours,
        });
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err.message || 'Error saving topic');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (topic) => {
    try {
      await updateTopic(topic._id, {
        completed: !topic.completed,
      });
      await loadData();
    } catch (err) {
      alert(err.message || 'Error updating topic status');
    }
  };

  const handleDeleteTopic = async (topicId, title) => {
    if (!window.confirm(`Are you sure you want to delete topic "${title}"?`)) {
      return;
    }

    try {
      await deleteTopic(topicId);
      await loadData();
    } catch (err) {
      alert(err.message || 'Error deleting topic');
    }
  };

  const filteredTopics = topics.filter((t) => {
    if (filter === 'completed') return t.completed;
    if (filter === 'incomplete') return !t.completed;
    return true;
  });

  const completedCount = topics.filter((t) => t.completed).length;
  const progressPercent = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <span className="ml-3 text-sm text-slate-500 font-medium">Loading topics...</span>
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl text-center max-w-md mx-auto">
        <p className="font-semibold text-sm mb-3">{error || 'Subject not found'}</p>
        <Link
          to="/subjects"
          className="text-xs bg-rose-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-rose-700"
        >
          &larr; Back to Subjects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb & Header */}
      <div>
        <Link
          to="/subjects"
          className="text-xs font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center space-x-1 mb-2"
        >
          <span>&larr;</span>
          <span>Back to Subjects</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{subject.name}</span>
            </h1>
            {subject.description && (
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">{subject.description}</p>
            )}
          </div>
          <button
            onClick={openAddModal}
            id="add-topic-btn"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors shadow-xs shadow-teal-200 self-start sm:self-auto"
          >
            <IconPlus className="w-4 h-4" />
            <span>Add Topic</span>
          </button>
        </div>
      </div>

      {/* Progress & Quick Stats Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Subject Mastery Progress
            </span>
            <span className="text-sm font-extrabold text-teal-600">
              {progressPercent}% ({completedCount} / {topics.length} Topics)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-teal-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 self-start md:self-auto bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({topics.length})
          </button>
          <button
            onClick={() => setFilter('incomplete')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'incomplete' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending ({topics.length - completedCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'completed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      {/* Topics List */}
      {topics.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <IconClock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No topics added for this subject.</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Break down this subject into individual chapters or topics to start planning.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors"
          >
            <IconPlus className="w-4 h-4" />
            <span>Add First Topic</span>
          </button>
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
          No topics matching the selected filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTopics.map((topic) => {
            const isCompleted = topic.completed;

            let diffBadge = 'bg-amber-50 text-amber-700 border-amber-200';
            if (topic.difficulty === 'Easy') diffBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            if (topic.difficulty === 'Hard') diffBadge = 'bg-rose-50 text-rose-700 border-rose-200';

            return (
              <div
                key={topic._id}
                className={`bg-white rounded-xl border p-4 transition-all flex items-center justify-between gap-4 ${
                  isCompleted
                    ? 'border-slate-200 bg-slate-50/50'
                    : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-start space-x-3.5 min-w-0">
                  <button
                    onClick={() => handleToggleComplete(topic)}
                    className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 hover:border-teal-600 bg-white text-transparent'
                    }`}
                    title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                  >
                    <IconCheck className="w-3.5 h-3.5" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h4
                        className={`text-sm font-semibold truncate ${
                          isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {topic.title}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diffBadge}`}>
                        {topic.difficulty}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                        <IconClock className="w-3 h-3" />
                        <span>{topic.estimatedHours}h est.</span>
                      </span>
                    </div>

                    {topic.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{topic.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => openEditModal(topic)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                    title="Edit Topic"
                  >
                    <IconEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTopic(topic._id, topic.title)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Delete Topic"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Topic Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingTopic ? 'Edit Topic' : 'Add New Topic'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <IconClose className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Topic Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Binary Search Trees & AVL"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Subtopics or key formulas to cover"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estimated Study Hours *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    required
                    value={formHours}
                    onChange={(e) => setFormHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
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
                  className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingTopic ? 'Update Topic' : 'Add Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
