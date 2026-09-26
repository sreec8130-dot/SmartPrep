const StudySession = require('../models/StudySession');
const Topic = require('../models/Topic');
const Subject = require('../models/Subject');

// GET /api/study-sessions
exports.getSessions = async (req, res) => {
  try {
    const filter = { user: req.userId };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const sessions = await StudySession.find(filter)
      .populate('subject', 'name color')
      .populate('topic', 'title difficulty estimatedHours completed')
      .sort({ date: 1 });

    return res.status(200).json({ sessions });
  } catch (error) {
    console.error('getSessions error:', error);
    return res.status(500).json({ message: 'Error fetching study sessions' });
  }
};

// GET /api/study-sessions/today
exports.getTodaySessions = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const sessions = await StudySession.find({
      user: req.userId,
      date: { $gte: startOfToday, $lte: endOfToday },
    })
      .populate('subject', 'name color')
      .populate('topic', 'title difficulty estimatedHours completed')
      .sort({ date: 1 });

    return res.status(200).json({ sessions });
  } catch (error) {
    console.error('getTodaySessions error:', error);
    return res.status(500).json({ message: 'Error fetching today sessions' });
  }
};

// POST /api/study-sessions
exports.createSession = async (req, res) => {
  try {
    const { subject, topic, date, duration, notes } = req.body;

    if (!subject || !topic || !date || !duration) {
      return res.status(400).json({ message: 'Subject, topic, date, and duration are required' });
    }

    // Verify ownership
    const subjectRecord = await Subject.findOne({ _id: subject, user: req.userId });
    if (!subjectRecord) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const session = await StudySession.create({
      user: req.userId,
      subject,
      topic,
      date: new Date(date),
      duration: Number(duration),
      notes: notes || '',
    });

    const populated = await StudySession.findById(session._id)
      .populate('subject', 'name color')
      .populate('topic', 'title difficulty estimatedHours completed');

    return res.status(201).json({ message: 'Session created successfully', session: populated });
  } catch (error) {
    console.error('createSession error:', error);
    return res.status(500).json({ message: 'Error creating study session' });
  }
};

// PUT /api/study-sessions/:id
exports.updateSession = async (req, res) => {
  try {
    const { status, actualMinutesStudied, notes, markTopicCompleted } = req.body;

    const session = await StudySession.findOne({ _id: req.params.id, user: req.userId });
    if (!session) {
      return res.status(404).json({ message: 'Study session not found' });
    }

    if (status !== undefined) {
      session.status = status;
      if (status === 'completed') {
        session.completedAt = new Date();
      } else {
        session.completedAt = null;
      }
    }

    if (actualMinutesStudied !== undefined) {
      session.actualMinutesStudied = Number(actualMinutesStudied) || 0;
    }

    if (notes !== undefined) {
      session.notes = notes;
    }

    await session.save();

    // Optionally mark associated topic as completed
    if (markTopicCompleted && session.topic) {
      await Topic.findOneAndUpdate(
        { _id: session.topic, user: req.userId },
        { completed: true, completedAt: new Date() }
      );
    }

    const populated = await StudySession.findById(session._id)
      .populate('subject', 'name color')
      .populate('topic', 'title difficulty estimatedHours completed');

    return res.status(200).json({ message: 'Session updated successfully', session: populated });
  } catch (error) {
    console.error('updateSession error:', error);
    return res.status(500).json({ message: 'Error updating study session' });
  }
};

// DELETE /api/study-sessions/:id
exports.deleteSession = async (req, res) => {
  try {
    const session = await StudySession.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!session) {
      return res.status(404).json({ message: 'Study session not found' });
    }

    return res.status(200).json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('deleteSession error:', error);
    return res.status(500).json({ message: 'Error deleting session' });
  }
};
