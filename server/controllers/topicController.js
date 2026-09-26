const Topic = require('../models/Topic');
const Subject = require('../models/Subject');
const StudySession = require('../models/StudySession');

// GET /api/subjects/:subjectId/topics
exports.getTopicsBySubject = async (req, res) => {
  try {
    const topics = await Topic.find({
      subject: req.params.subjectId,
      user: req.userId,
    }).sort({ createdAt: 1 });

    return res.status(200).json({ topics });
  } catch (error) {
    console.error('getTopicsBySubject error:', error);
    return res.status(500).json({ message: 'Error fetching topics' });
  }
};

// POST /api/subjects/:subjectId/topics
exports.createTopic = async (req, res) => {
  try {
    const { title, description, difficulty, estimatedHours } = req.body;
    const { subjectId } = req.params;

    // Verify subject belongs to user
    const subject = await Subject.findOne({ _id: subjectId, user: req.userId });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Topic title is required' });
    }

    const hours = Number(estimatedHours);
    if (isNaN(hours) || hours <= 0) {
      return res.status(400).json({ message: 'Estimated hours must be greater than 0' });
    }

    const topic = await Topic.create({
      user: req.userId,
      subject: subjectId,
      title: title.trim(),
      description: description ? description.trim() : '',
      difficulty: ['Easy', 'Medium', 'Hard'].includes(difficulty) ? difficulty : 'Medium',
      estimatedHours: hours,
    });

    return res.status(201).json({ message: 'Topic added successfully', topic });
  } catch (error) {
    console.error('createTopic error:', error);
    return res.status(500).json({ message: 'Error creating topic' });
  }
};

// PUT /api/topics/:id
exports.updateTopic = async (req, res) => {
  try {
    const { title, description, difficulty, estimatedHours, completed } = req.body;

    const topic = await Topic.findOne({ _id: req.params.id, user: req.userId });
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    if (title !== undefined) topic.title = title.trim();
    if (description !== undefined) topic.description = description.trim();
    if (difficulty !== undefined && ['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      topic.difficulty = difficulty;
    }
    if (estimatedHours !== undefined) {
      const hours = Number(estimatedHours);
      if (hours > 0) topic.estimatedHours = hours;
    }

    if (completed !== undefined) {
      topic.completed = Boolean(completed);
      topic.completedAt = topic.completed ? new Date() : null;
    }

    await topic.save();

    return res.status(200).json({ message: 'Topic updated successfully', topic });
  } catch (error) {
    console.error('updateTopic error:', error);
    return res.status(500).json({ message: 'Error updating topic' });
  }
};

// DELETE /api/topics/:id
exports.deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Cascade delete sessions for this topic
    await StudySession.deleteMany({ topic: req.params.id, user: req.userId });

    return res.status(200).json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('deleteTopic error:', error);
    return res.status(500).json({ message: 'Error deleting topic' });
  }
};
