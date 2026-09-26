const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const Exam = require('../models/Exam');
const StudySession = require('../models/StudySession');
const predefinedSubjects = require('../data/predefinedSubjects');

// GET /api/subjects/predefined
exports.getPredefinedSubjects = async (req, res) => {
  try {
    return res.status(200).json({ predefinedSubjects });
  } catch (error) {
    console.error('getPredefinedSubjects error:', error);
    return res.status(500).json({ message: 'Error fetching predefined subjects' });
  }
};

// GET /api/subjects
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.userId }).sort({ createdAt: -1 });

    // Aggregate topic stats for each subject
    const subjectsWithStats = await Promise.all(
      subjects.map(async (subject) => {
        const totalTopics = await Topic.countDocuments({ subject: subject._id, user: req.userId });
        const completedTopics = await Topic.countDocuments({
          subject: subject._id,
          user: req.userId,
          completed: true,
        });
        const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

        return {
          ...subject.toObject(),
          totalTopics,
          completedTopics,
          progress,
        };
      })
    );

    return res.status(200).json({ subjects: subjectsWithStats });
  } catch (error) {
    console.error('getSubjects error:', error);
    return res.status(500).json({ message: 'Error fetching subjects' });
  }
};

// POST /api/subjects
exports.createSubject = async (req, res) => {
  try {
    const { name, description, examDate, color, topics } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Subject name is required' });
    }

    // Timezone safe exam date parsing
    let parsedExamDate = undefined;
    if (examDate) {
      const parts = String(examDate).split('T')[0].split('-');
      if (parts.length === 3) {
        parsedExamDate = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0));
      } else {
        parsedExamDate = new Date(examDate);
      }
    }

    const subject = await Subject.create({
      user: req.userId,
      name: name.trim(),
      description: description ? description.trim() : '',
      examDate: parsedExamDate,
      color: color || 'indigo',
    });

    // If predefined or custom topics are provided with subject creation
    let createdTopics = [];
    if (Array.isArray(topics) && topics.length > 0) {
      const topicDocs = topics.map((t) => {
        const minutes = Number(t.estimatedStudyMinutes) || (Number(t.estimatedHours) || 1) * 60;
        return {
          user: req.userId,
          subject: subject._id,
          title: t.title.trim(),
          description: t.description ? t.description.trim() : '',
          difficulty: ['Easy', 'Medium', 'Hard'].includes(t.difficulty) ? t.difficulty : 'Medium',
          priority: ['Low', 'Medium', 'High'].includes(t.priority) ? t.priority : 'Medium',
          estimatedHours: Number((minutes / 60).toFixed(1)),
          estimatedStudyMinutes: minutes,
          completed: false,
        };
      });

      createdTopics = await Topic.insertMany(topicDocs);
    }

    return res.status(201).json({
      message: 'Subject created successfully',
      subject: {
        ...subject.toObject(),
        topics: createdTopics,
        totalTopics: createdTopics.length,
        completedTopics: 0,
        progress: 0,
      },
    });
  } catch (error) {
    console.error('createSubject error:', error);
    return res.status(500).json({ message: 'Error creating subject' });
  }
};

// GET /api/subjects/:id
exports.getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, user: req.userId });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const topics = await Topic.find({ subject: subject._id, user: req.userId }).sort({ createdAt: 1 });
    const totalTopics = topics.length;
    const completedTopics = topics.filter((t) => t.completed).length;
    const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return res.status(200).json({
      subject: {
        ...subject.toObject(),
        topics,
        totalTopics,
        completedTopics,
        progress,
      },
    });
  } catch (error) {
    console.error('getSubjectById error:', error);
    return res.status(500).json({ message: 'Error fetching subject details' });
  }
};

// PUT /api/subjects/:id
exports.updateSubject = async (req, res) => {
  try {
    const { name, description, examDate, color } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Subject name is required' });
    }

    let parsedExamDate = null;
    if (examDate) {
      const parts = String(examDate).split('T')[0].split('-');
      if (parts.length === 3) {
        parsedExamDate = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0));
      } else {
        parsedExamDate = new Date(examDate);
      }
    }

    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      {
        name: name.trim(),
        description: description ? description.trim() : '',
        examDate: parsedExamDate,
        color: color || 'indigo',
      },
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    return res.status(200).json({ message: 'Subject updated successfully', subject });
  } catch (error) {
    console.error('updateSubject error:', error);
    return res.status(500).json({ message: 'Error updating subject' });
  }
};

// DELETE /api/subjects/:id
exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Cascade delete topics, exams, and study sessions
    await Topic.deleteMany({ subject: req.params.id, user: req.userId });
    await Exam.deleteMany({ subject: req.params.id, user: req.userId });
    await StudySession.deleteMany({ subject: req.params.id, user: req.userId });

    return res.status(200).json({ message: 'Subject and related records deleted successfully' });
  } catch (error) {
    console.error('deleteSubject error:', error);
    return res.status(500).json({ message: 'Error deleting subject' });
  }
};
