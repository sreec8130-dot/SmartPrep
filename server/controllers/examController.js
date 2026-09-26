const Exam = require('../models/Exam');
const Subject = require('../models/Subject');

// Helper to parse date string safely to UTC midday
function parseDateSafe(dateInput) {
  if (!dateInput) return null;
  const str = String(dateInput).split('T')[0];
  const parts = str.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    return new Date(Date.UTC(y, m, d, 12, 0, 0));
  }
  return new Date(dateInput);
}

// GET /api/exams
exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.find({ user: req.userId })
      .populate('subject', 'name color')
      .sort({ examDate: 1 });

    // Clean up any exams whose subjects might have been deleted
    const sanitizedExams = exams.map((exam) => {
      const obj = exam.toObject();
      if (!obj.subject) {
        obj.subject = { name: 'General / Unknown', color: 'indigo' };
      }
      // Add explicit date string
      obj.examDateFormatted = exam.examDate ? exam.examDate.toISOString().slice(0, 10) : '';
      return obj;
    });

    return res.status(200).json({ exams: sanitizedExams });
  } catch (error) {
    console.error('getExams error:', error);
    return res.status(500).json({ message: 'Error fetching exams' });
  }
};

// POST /api/exams
exports.createExam = async (req, res) => {
  try {
    const { subject, examName, examDate } = req.body;

    if (!subject) {
      return res.status(400).json({ message: 'Subject is required' });
    }

    if (!examName || !examName.trim()) {
      return res.status(400).json({ message: 'Exam name is required' });
    }

    if (!examDate) {
      return res.status(400).json({ message: 'Exam date is required' });
    }

    const parsedDate = parseDateSafe(examDate);
    if (!parsedDate || isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid exam date format' });
    }

    // Verify subject belongs to user
    const subjectRecord = await Subject.findOne({ _id: subject, user: req.userId });
    if (!subjectRecord) {
      return res.status(404).json({ message: 'Selected subject not found' });
    }

    const exam = await Exam.create({
      user: req.userId,
      subject,
      examName: examName.trim(),
      examDate: parsedDate,
    });

    const populatedExam = await Exam.findById(exam._id).populate('subject', 'name color');

    return res.status(201).json({ message: 'Exam added successfully', exam: populatedExam });
  } catch (error) {
    console.error('createExam error:', error);
    return res.status(500).json({ message: 'Error creating exam' });
  }
};

// PUT /api/exams/:id
exports.updateExam = async (req, res) => {
  try {
    const { subject, examName, examDate } = req.body;

    const exam = await Exam.findOne({ _id: req.params.id, user: req.userId });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (subject) {
      const subjectRecord = await Subject.findOne({ _id: subject, user: req.userId });
      if (!subjectRecord) {
        return res.status(404).json({ message: 'Subject not found' });
      }
      exam.subject = subject;
    }

    if (examName && examName.trim()) {
      exam.examName = examName.trim();
    }

    if (examDate) {
      const parsedDate = parseDateSafe(examDate);
      if (parsedDate && !isNaN(parsedDate.getTime())) {
        exam.examDate = parsedDate;
      }
    }

    await exam.save();
    const populated = await Exam.findById(exam._id).populate('subject', 'name color');

    return res.status(200).json({ message: 'Exam updated successfully', exam: populated });
  } catch (error) {
    console.error('updateExam error:', error);
    return res.status(500).json({ message: 'Error updating exam' });
  }
};

// DELETE /api/exams/:id
exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    return res.status(200).json({ message: 'Exam deleted successfully' });
  } catch (error) {
    console.error('deleteExam error:', error);
    return res.status(500).json({ message: 'Error deleting exam' });
  }
};
