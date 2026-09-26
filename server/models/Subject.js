const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  examDate: {
    type: Date,
  },
  color: {
    type: String,
    default: 'indigo', // indigo, emerald, amber, rose, sky, purple
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Subject', subjectSchema);
