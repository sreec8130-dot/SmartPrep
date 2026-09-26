const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    default: 'Personalized Study Plan',
    trim: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    default: '09:00', // HH:MM in 24h format
  },
  endTime: {
    type: String,
    default: '13:00', // HH:MM in 24h format
  },
  dailyHours: {
    type: Number,
    required: true,
    min: 0.5,
  },
  dailyAvailableMinutes: {
    type: Number,
    default: 240,
  },
  preferredDuration: {
    type: Number,
    default: 60, // in minutes
  },
  sessionDurationMinutes: {
    type: Number,
    default: 60,
  },
  breakDurationMinutes: {
    type: Number,
    default: 15,
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active',
  },
  totalRequiredHours: {
    type: Number,
    default: 0,
  },
  totalAvailableHours: {
    type: Number,
    default: 0,
  },
  unscheduledTopics: [
    {
      title: String,
      subjectName: String,
      remainingMinutes: Number,
    },
  ],
  subjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
  ],
  aiGenerated: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
