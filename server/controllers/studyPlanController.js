const StudyPlan = require('../models/StudyPlan');
const StudySession = require('../models/StudySession');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const Exam = require('../models/Exam');
const aiService = require('../services/aiService');

// POST /api/study-plans/generate
exports.generatePlan = async (req, res) => {
  try {
    const {
      subjects,
      topicIds,
      availableDailyHours,
      startDate,
      endDate,
      startTime = '09:00',
      endTime = '13:00',
      preferredSessionDuration = 60,
      breakDuration = 15,
      title,
    } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and End date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      return res.status(400).json({ message: 'Invalid start or end date' });
    }

    // Determine target subjects
    let subjectFilter = { user: req.userId };
    if (Array.isArray(subjects) && subjects.length > 0) {
      subjectFilter._id = { $in: subjects };
    }

    const userSubjects = await Subject.find(subjectFilter);
    if (userSubjects.length === 0) {
      return res.status(400).json({ message: 'No subjects selected or found. Please create a subject first.' });
    }

    const subjectIdList = userSubjects.map((s) => s._id);

    // Topic query filter: incomplete topics
    const topicFilter = {
      user: req.userId,
      subject: { $in: subjectIdList },
      completed: false,
    };

    if (Array.isArray(topicIds) && topicIds.length > 0) {
      topicFilter._id = { $in: topicIds };
    }

    const topics = await Topic.find(topicFilter).populate('subject', 'name color');

    if (topics.length === 0) {
      return res.status(400).json({
        message: 'No incomplete topics found for the selected subjects. Please add topics or mark some as incomplete.',
      });
    }

    // Fetch exams for urgency calculations
    const exams = await Exam.find({
      user: req.userId,
      subject: { $in: subjectIdList },
    }).populate('subject', 'name');

    // Generate schedule using Timetable Algorithm (with AI fallback)
    const planResult = await aiService.generateStudyPlan({
      topics,
      exams,
      startDate: start,
      endDate: end,
      startTime,
      endTime,
      sessionDuration: Number(preferredSessionDuration) || 60,
      breakDuration: Number(breakDuration) !== undefined ? Number(breakDuration) : 15,
    });

    if (!planResult.sessions || planResult.sessions.length === 0) {
      return res.status(400).json({ message: 'Unable to schedule sessions within the given date and time window.' });
    }

    // Replace / Deactivate previous active plans to prevent duplicates
    const previousActivePlans = await StudyPlan.find({ user: req.userId, status: 'active' });
    if (previousActivePlans.length > 0) {
      const prevIds = previousActivePlans.map((p) => p._id);
      await StudySession.deleteMany({ studyPlan: { $in: prevIds }, user: req.userId, status: 'pending' });
      await StudyPlan.updateMany({ _id: { $in: prevIds } }, { status: 'archived' });
    }

    const dailyHoursCalc = Number(availableDailyHours) || 4;

    // Create new StudyPlan document
    const studyPlan = await StudyPlan.create({
      user: req.userId,
      title: title && title.trim() ? title.trim() : 'Personalized Study Timetable',
      startDate: start,
      endDate: end,
      startTime,
      endTime,
      dailyHours: dailyHoursCalc,
      sessionDurationMinutes: Number(preferredSessionDuration) || 60,
      breakDurationMinutes: Number(breakDuration) !== undefined ? Number(breakDuration) : 15,
      preferredDuration: Number(preferredSessionDuration) || 60,
      subjects: subjectIdList,
      status: 'active',
      totalRequiredHours: planResult.totalRequiredHours || 0,
      totalAvailableHours: planResult.totalAvailableHours || 0,
      unscheduledTopics: planResult.unscheduledTopics || [],
      aiGenerated: planResult.aiGenerated,
    });

    // Create StudySession documents
    const sessionDocs = planResult.sessions.map((s) => ({
      user: req.userId,
      studyPlan: studyPlan._id,
      subject: s.subject,
      topic: s.topic,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      duration: s.duration,
      durationMinutes: s.duration,
      partTitle: s.partTitle || '',
      isRevision: Boolean(s.isRevision),
      status: 'pending',
      actualMinutesStudied: 0,
    }));

    await StudySession.insertMany(sessionDocs);

    // Populate created sessions with details
    const populatedSessions = await StudySession.find({ studyPlan: studyPlan._id })
      .populate('subject', 'name color')
      .populate('topic', 'title difficulty priority estimatedHours estimatedStudyMinutes completed')
      .sort({ date: 1, startTime: 1 });

    return res.status(201).json({
      message: 'Study timetable generated successfully',
      plan: studyPlan,
      sessions: populatedSessions,
      unscheduledTopics: planResult.unscheduledTopics || [],
      totalRequiredHours: planResult.totalRequiredHours,
      totalAvailableHours: planResult.totalAvailableHours,
    });
  } catch (error) {
    console.error('generatePlan error:', error);
    return res.status(500).json({ message: 'Error generating study timetable' });
  }
};

// GET /api/study-plans
exports.getPlans = async (req, res) => {
  try {
    const plans = await StudyPlan.find({ user: req.userId })
      .populate('subjects', 'name color')
      .sort({ createdAt: -1 });

    return res.status(200).json({ plans });
  } catch (error) {
    console.error('getPlans error:', error);
    return res.status(500).json({ message: 'Error fetching study plans' });
  }
};

// GET /api/study-plans/:id
exports.getPlanById = async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ _id: req.params.id, user: req.userId })
      .populate('subjects', 'name color');

    if (!plan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    const sessions = await StudySession.find({ studyPlan: plan._id, user: req.userId })
      .populate('subject', 'name color')
      .populate('topic', 'title difficulty priority estimatedHours estimatedStudyMinutes completed')
      .sort({ date: 1 });

    return res.status(200).json({ plan, sessions });
  } catch (error) {
    console.error('getPlanById error:', error);
    return res.status(500).json({ message: 'Error fetching study plan details' });
  }
};

// DELETE /api/study-plans/:id
exports.deletePlan = async (req, res) => {
  try {
    const plan = await StudyPlan.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!plan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    await StudySession.deleteMany({ studyPlan: req.params.id, user: req.userId });

    return res.status(200).json({ message: 'Study plan and its sessions deleted successfully' });
  } catch (error) {
    console.error('deletePlan error:', error);
    return res.status(500).json({ message: 'Error deleting study plan' });
  }
};
