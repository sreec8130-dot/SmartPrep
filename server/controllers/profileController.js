const User = require('../models/User');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const StudySession = require('../models/StudySession');

// GET /api/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalSubjects = await Subject.countDocuments({ user: req.userId });
    const completedTopics = await Topic.countDocuments({ user: req.userId, completed: true });
    const completedSessions = await StudySession.countDocuments({ user: req.userId, status: 'completed' });

    return res.status(200).json({
      user,
      stats: {
        totalSubjects,
        completedTopics,
        completedSessions,
      },
    });
  } catch (error) {
    console.error('getProfile error:', error);
    return res.status(500).json({ message: 'Error fetching profile' });
  }
};

// PUT /api/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name cannot be empty' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name: name.trim() },
      { new: true }
    ).select('-password');

    return res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('updateProfile error:', error);
    return res.status(500).json({ message: 'Error updating profile' });
  }
};
