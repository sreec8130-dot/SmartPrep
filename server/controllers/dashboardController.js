const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const Exam = require('../models/Exam');
const StudySession = require('../models/StudySession');

// GET /api/dashboard
exports.getDashboardData = async (req, res) => {
  try {
    // 1. Summary card metrics
    const totalSubjects = await Subject.countDocuments({ user: req.userId });
    const totalTopics = await Topic.countDocuments({ user: req.userId });
    const completedTopics = await Topic.countDocuments({ user: req.userId, completed: true });

    // Midnight today in UTC comparison
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const upcomingExamsCount = await Exam.countDocuments({
      user: req.userId,
      examDate: { $gte: startOfToday },
    });

    // Calculate total study hours logged
    const completedSessions = await StudySession.find({
      user: req.userId,
      status: 'completed',
    });

    const totalMinutes = completedSessions.reduce((acc, s) => {
      return acc + (s.actualMinutesStudied > 0 ? s.actualMinutesStudied : s.duration);
    }, 0);
    const totalStudyHours = (totalMinutes / 60).toFixed(1);

    // 2. Today's plan
    const endOfToday = new Date();
    endOfToday.setUTCHours(23, 59, 59, 999);

    const todaySessions = await StudySession.find({
      user: req.userId,
      date: { $gte: startOfToday, $lte: endOfToday },
    })
      .populate('subject', 'name color')
      .populate('topic', 'title difficulty estimatedHours completed')
      .sort({ startTime: 1, date: 1 });

    // 3. Overall Progress
    const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    // Subject breakdown
    const subjects = await Subject.find({ user: req.userId });
    const subjectProgress = await Promise.all(
      subjects.map(async (subj) => {
        const subTotal = await Topic.countDocuments({ subject: subj._id, user: req.userId });
        const subCompleted = await Topic.countDocuments({ subject: subj._id, user: req.userId, completed: true });
        const pct = subTotal > 0 ? Math.round((subCompleted / subTotal) * 100) : 0;
        return {
          id: subj._id,
          name: subj.name,
          color: subj.color,
          total: subTotal,
          completed: subCompleted,
          progress: pct,
        };
      })
    );

    // 4. Upcoming Exams (filtered to upcoming only)
    const rawUpcomingExams = await Exam.find({
      user: req.userId,
      examDate: { $gte: startOfToday },
    })
      .populate('subject', 'name color')
      .sort({ examDate: 1 })
      .limit(5);

    const upcomingExams = rawUpcomingExams.map((exam) => {
      const obj = exam.toObject();
      if (!obj.subject) {
        obj.subject = { name: 'General', color: 'indigo' };
      }
      obj.examDateFormatted = exam.examDate ? exam.examDate.toISOString().slice(0, 10) : '';
      return obj;
    });

    return res.status(200).json({
      summary: {
        totalSubjects,
        totalTopics,
        completedTopics,
        upcomingExamsCount,
        totalStudyHours: Number(totalStudyHours),
      },
      todaySessions,
      overallProgress,
      subjectProgress,
      upcomingExams,
    });
  } catch (error) {
    console.error('getDashboardData error:', error);
    return res.status(500).json({ message: 'Error fetching dashboard data' });
  }
};
