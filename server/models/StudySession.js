const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  studyPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyPlan',
    default: null,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    default: '09:00 AM',
  },
  endTime: {
    type: String,
    default: '10:00 AM',
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  durationMinutes: {
    type: Number,
    default: 60,
  },
  isRevision: {
    type: Boolean,
    default: false,
  },
  partTitle: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'missed'],
    default: 'pending',
  },
  actualMinutesStudied: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    default: '',
  },
  completedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('StudySession', studySessionSchema);
