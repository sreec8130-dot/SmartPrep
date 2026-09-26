/**
 * AI & Smart Timetable Scheduling Service for SmartPrep
 * 
 * Supports:
 * - Specific start time and end time for daily study window
 * - Automatic break intervals (e.g. 15 minutes) between sessions
 * - Splitting large topics into Part 1, Part 2, etc.
 * - Nearest exam proximity and topic difficulty prioritization
 * - Reserving 20-30% of surplus time for revision
 * - Tracking and reporting unscheduled topics when time is constrained
 */

// Helper to format minutes from midnight (e.g. 540) to "09:00 AM"
function formatMinutesToTime(totalMinutes) {
  let hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 hour is 12 AM
  const strHours = String(hours).padStart(2, '0');
  const strMinutes = String(minutes).padStart(2, '0');
  return `${strHours}:${strMinutes} ${ampm}`;
}

// Helper to parse "09:00" or "09:00 AM" to minutes from midnight
function parseTimeToMinutes(timeStr, defaultMinutes = 540) {
  if (!timeStr) return defaultMinutes;
  try {
    const clean = timeStr.trim().toUpperCase();
    const isPM = clean.includes('PM');
    const isAM = clean.includes('AM');
    const parts = clean.replace(/[^\d:]/g, '').split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parts.length > 1 ? parseInt(parts[1], 10) : 0;

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    return hours * 60 + minutes;
  } catch {
    return defaultMinutes;
  }
}

/**
 * Deterministic Timetable Scheduling Algorithm
 */
function generateDeterministicTimetable({
  topics,
  exams,
  startDate,
  endDate,
  startTime = '09:00',
  endTime = '13:00',
  sessionDuration = 60,
  breakDuration = 15,
}) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const dayDifference = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);

  const startMinute = parseTimeToMinutes(startTime, 540); // 09:00 AM
  let endMinute = parseTimeToMinutes(endTime, 780); // 01:00 PM

  if (endMinute <= startMinute) {
    endMinute = startMinute + 240; // fallback to 4 hours window
  }

  const sessionLen = Number(sessionDuration) || 60;
  const breakLen = Number(breakDuration) !== undefined ? Number(breakDuration) : 15;

  // 1. Generate Daily Time Slots across the entire date range
  const dailySlotsTemplate = [];
  let curr = startMinute;
  while (curr + sessionLen <= endMinute) {
    dailySlotsTemplate.push({
      startMinute: curr,
      endMinute: curr + sessionLen,
      startTime: formatMinutesToTime(curr),
      endTime: formatMinutesToTime(curr + sessionLen),
      duration: sessionLen,
    });
    curr += sessionLen + breakLen;
  }

  // If no slot could fit (e.g. window < sessionLen), fit at least 1 slot
  if (dailySlotsTemplate.length === 0) {
    const singleSlotDuration = Math.max(30, endMinute - startMinute);
    dailySlotsTemplate.push({
      startMinute: startMinute,
      endMinute: startMinute + singleSlotDuration,
      startTime: formatMinutesToTime(startMinute),
      endTime: formatMinutesToTime(startMinute + singleSlotDuration),
      duration: singleSlotDuration,
    });
  }

  const allAvailableSlots = [];
  for (let dayOffset = 0; dayOffset < dayDifference; dayOffset++) {
    const dayDate = new Date(start);
    dayDate.setDate(dayDate.getDate() + dayOffset);
    dayDate.setHours(12, 0, 0, 0); // Normalized midday to avoid timezone shifts

    for (const slot of dailySlotsTemplate) {
      allAvailableSlots.push({
        date: dayDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: slot.duration,
      });
    }
  }

  // 2. Exam Urgency Map
  const examMap = {};
  exams.forEach((exam) => {
    const sId = exam.subject?._id ? exam.subject._id.toString() : exam.subject.toString();
    const eDate = new Date(exam.examDate);
    if (!examMap[sId] || eDate < examMap[sId]) {
      examMap[sId] = eDate;
    }
  });

  // 3. Topic Priority Weights
  const diffWeight = { Hard: 3, Medium: 2, Easy: 1 };
  const prioWeight = { High: 3, Medium: 2, Low: 1 };

  const prioritizedTopics = topics
    .filter((t) => !t.completed)
    .map((topic) => {
      const sId = topic.subject?._id ? topic.subject._id.toString() : topic.subject.toString();
      const examDate = examMap[sId];

      let examScore = 1;
      if (examDate) {
        const daysToExam = Math.max(0, (examDate - start) / (1000 * 60 * 60 * 24));
        examScore = Math.max(1, Math.round(100 / (daysToExam + 1)));
      }

      const dScore = diffWeight[topic.difficulty] || 2;
      const pScore = prioWeight[topic.priority] || 2;
      const score = examScore * 10 + dScore * 5 + pScore * 3;

      const totalMins =
        topic.estimatedStudyMinutes || Math.round((topic.estimatedHours || 1) * 60);

      return {
        topic,
        priorityScore: score,
        totalMinutes: totalMins,
        remainingMinutes: totalMins,
      };
    });

  // Sort by priority descending
  prioritizedTopics.sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }
    return b.totalMinutes - a.totalMinutes;
  });

  // 4. Split Large Topics into Slices (e.g. Trees – Part 1, Part 2...)
  const topicSlices = [];
  for (const item of prioritizedTopics) {
    let partNum = 1;
    let rem = item.remainingMinutes;
    const isSplittable = rem > sessionLen;

    while (rem > 0) {
      const sliceDuration = Math.min(rem, sessionLen);
      topicSlices.push({
        topic: item.topic,
        subject: item.topic.subject?._id || item.topic.subject,
        duration: sliceDuration,
        partTitle: isSplittable ? `${item.topic.title} – Part ${partNum}` : item.topic.title,
        isRevision: false,
      });
      rem -= sliceDuration;
      partNum++;
    }
  }

  // 5. Check capacity & Unscheduled Topics
  const totalSlots = allAvailableSlots.length;
  const totalRequiredSlices = topicSlices.length;
  const scheduledSessions = [];
  const unscheduledTopicsMap = new Map();

  let slotIndex = 0;

  // Allocate topic slices to available slots
  for (const slice of topicSlices) {
    if (slotIndex < totalSlots) {
      const slot = allAvailableSlots[slotIndex];
      scheduledSessions.push({
        subject: slice.subject,
        topic: slice.topic._id,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: slot.duration,
        durationMinutes: slot.duration,
        partTitle: slice.partTitle,
        isRevision: false,
        status: 'pending',
      });
      slotIndex++;
    } else {
      // Over capacity: record as unscheduled
      const tId = slice.topic._id.toString();
      if (!unscheduledTopicsMap.has(tId)) {
        unscheduledTopicsMap.set(tId, {
          title: slice.topic.title,
          subjectName: slice.topic.subject?.name || 'Subject',
          remainingMinutes: 0,
        });
      }
      unscheduledTopicsMap.get(tId).remainingMinutes += slice.duration;
    }
  }

  // 6. Revision Reservation: If spare slots remain, reserve 20–30% of surplus for revision
  const remainingSlots = totalSlots - slotIndex;
  if (remainingSlots > 0 && scheduledSessions.length > 0) {
    const revisionSlotsCount = Math.min(
      remainingSlots,
      Math.max(1, Math.round(totalSlots * 0.25))
    );

    // Pick top high-difficulty topics to revise
    const coveredTopics = [...new Set(scheduledSessions.map((s) => s.topic.toString()))];
    for (let i = 0; i < revisionSlotsCount && slotIndex < totalSlots; i++) {
      const targetTopicId = coveredTopics[i % coveredTopics.length];
      const origSession = scheduledSessions.find((s) => s.topic.toString() === targetTopicId);
      if (origSession) {
        const slot = allAvailableSlots[slotIndex];
        scheduledSessions.push({
          subject: origSession.subject,
          topic: origSession.topic,
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          duration: slot.duration,
          durationMinutes: slot.duration,
          partTitle: `Revision: ${origSession.partTitle.replace(/ – Part \d+/, '')}`,
          isRevision: true,
          status: 'pending',
        });
        slotIndex++;
      }
    }
  }

  const unscheduledTopics = Array.from(unscheduledTopicsMap.values());
  const totalRequiredMinutes = topicSlices.reduce((acc, s) => acc + s.duration, 0);
  const totalAvailableMinutes = totalSlots * sessionLen;

  return {
    sessions: scheduledSessions,
    unscheduledTopics,
    totalRequiredHours: Number((totalRequiredMinutes / 60).toFixed(1)),
    totalAvailableHours: Number((totalAvailableMinutes / 60).toFixed(1)),
    aiGenerated: false,
  };
}

/**
 * Attempts AI generation or seamlessly falls back to deterministic timetable
 */
async function generateAIPlan(params) {
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const { topics, exams, startDate, endDate, startTime, endTime, sessionDuration, breakDuration } = params;
    const prompt = `You are an expert student study timetable generator.
Generate a realistic daily study timetable adhering strictly to:
Daily window: ${startTime} to ${endTime}
Session length: ${sessionDuration} minutes
Break length: ${breakDuration} minutes
Start Date: ${startDate}
End Date: ${endDate}

Topics:
${JSON.stringify(topics.map((t) => ({ id: t._id, title: t.title, subject: t.subject?.name, difficulty: t.difficulty, mins: t.estimatedStudyMinutes || 60 })))}

Exams:
${JSON.stringify(exams.map((e) => ({ name: e.examName, date: e.examDate, subject: e.subject?.name })))}

Rules:
1. Include exact startTime and endTime for each session.
2. Insert breaks between sessions.
3. Split topics > ${sessionDuration} mins into Part 1, Part 2.
4. Return ONLY valid JSON array with objects: [{ "subject": "subjectId", "topic": "topicId", "date": "YYYY-MM-DD", "startTime": "09:00 AM", "endTime": "10:00 AM", "duration": 60, "partTitle": "Title - Part 1" }]`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;

    const sessions = parsed.map((s) => ({
      subject: s.subject,
      topic: s.topic,
      date: new Date(s.date),
      startTime: s.startTime,
      endTime: s.endTime,
      duration: Number(s.duration) || sessionDuration,
      durationMinutes: Number(s.duration) || sessionDuration,
      partTitle: s.partTitle || '',
      isRevision: false,
      status: 'pending',
    }));

    return {
      sessions,
      unscheduledTopics: [],
      totalRequiredHours: (sessions.length * sessionDuration) / 60,
      totalAvailableHours: (sessions.length * sessionDuration) / 60,
      aiGenerated: true,
    };
  } catch (err) {
    console.warn('AI plan generation error, falling back to deterministic timetable:', err.message);
    return null;
  }
}

exports.generateStudyPlan = async function (params) {
  const aiResult = await generateAIPlan(params);
  if (aiResult && aiResult.sessions && aiResult.sessions.length > 0) {
    return aiResult;
  }
  return generateDeterministicTimetable(params);
};
