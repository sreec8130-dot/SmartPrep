const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const StudySession = require('../models/StudySession');

// GET /api/progress
exports.getProgressData = async (req, res) => {
  try {
    const totalTopics = await Topic.countDocuments({ user: req.userId });
    const completedTopics = await Topic.countDocuments({ user: req.userId, completed: true });
    const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    // Subject breakdown
    const subjects = await Subject.find({ user: req.userId });
    const subjectBreakdown = await Promise.all(
      subjects.map(async (subj) => {
        const total = await Topic.countDocuments({ subject: subj._id, user: req.userId });
        const completed = await Topic.countDocuments({ subject: subj._id, user: req.userId, completed: true });
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        return {
          id: subj._id,
          name: subj.name,
          color: subj.color,
          totalTopics: total,
          completedTopics: completed,
          progressPercent: pct,
        };
      })
    );

    // Study statistics
    const allSessions = await StudySession.find({ user: req.userId }).sort({ date: 1 });
    const completedSessionsList = allSessions.filter(s => s.status === 'completed');
    const pendingSessionsList = allSessions.filter(s => s.status === 'pending');

    const totalMinutes = completedSessionsList.reduce((acc, s) => {
      return acc + (s.actualMinutesStudied > 0 ? s.actualMinutesStudied : s.duration);
    }, 0);
    const totalStudyHours = (totalMinutes / 60).toFixed(1);

    // Calculate daily streak
    const completedDates = new Set();
    completedSessionsList.forEach(s => {
      const d = s.completedAt ? new Date(s.completedAt) : new Date(s.date);
      completedDates.add(d.toISOString().slice(0, 10));
    });

    let streak = 0;
    let checkDate = new Date();
    // Allow today or yesterday as streak anchor
    const todayStr = checkDate.toISOString().slice(0, 10);
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = checkDate.toISOString().slice(0, 10);

    let currentStr = completedDates.has(todayStr) ? todayStr : (completedDates.has(yesterdayStr) ? yesterdayStr : null);

    if (currentStr) {
      let runner = new Date(currentStr);
      while (completedDates.has(runner.toISOString().slice(0, 10))) {
        streak++;
        runner.setDate(runner.getDate() - 1);
      }
    }

    return res.status(200).json({
      overallProgress: {
        totalTopics,
        completedTopics,
        percent: overallProgress,
      },
      subjectProgress: subjectBreakdown,
      stats: {
        totalStudyHours: Number(totalStudyHours),
        completedSessions: completedSessionsList.length,
        pendingSessions: pendingSessionsList.length,
        currentStreak: streak,
      },
    });
  } catch (error) {
    console.error('getProgressData error:', error);
    return res.status(500).json({ message: 'Error fetching progress data' });
  }
};
