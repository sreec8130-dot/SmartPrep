// Full Frontend API Utility for SmartPrep
import { getToken, logout } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const DIRECT_BACKEND_ORIGIN = 'http://localhost:5000';

const safeFetch = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (error) {
    // If relative proxy request failed, attempt direct backend on port 5000 in local development
    if (url.startsWith('/api') && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      try {
        const directUrl = `${DIRECT_BACKEND_ORIGIN}${url}`;
        response = await fetch(directUrl, { ...options, headers });
      } catch (fallbackError) {
        throw new Error(
          'Unable to connect to the backend server. Please make sure the server is running on port 5000.'
        );
      }
    } else {
      throw new Error(
        'Unable to connect to the backend server. Please check your network connection.'
      );
    }
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    // Automatic JWT session expiry / invalid token handling
    if (response.status === 401) {
      logout();
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/register') &&
        window.location.pathname !== '/' &&
        window.location.pathname !== '/landing'
      ) {
        window.location.href = '/login';
      }
    }
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
};

// ================= AUTHENTICATION =================
export const register = async ({ name, email, password }) => {
  return await safeFetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
};

export const login = async ({ email, password }) => {
  return await safeFetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const getCurrentUser = async () => {
  return await safeFetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
  });
};

// ================= SUBJECTS =================
export const getPredefinedSubjects = async () => {
  return await safeFetch(`${API_BASE_URL}/subjects/predefined`, { method: 'GET' });
};

export const getSubjects = async () => {
  return await safeFetch(`${API_BASE_URL}/subjects`, { method: 'GET' });
};

export const createSubject = async (subjectData) => {
  return await safeFetch(`${API_BASE_URL}/subjects`, {
    method: 'POST',
    body: JSON.stringify(subjectData),
  });
};

export const getSubjectById = async (id) => {
  return await safeFetch(`${API_BASE_URL}/subjects/${id}`, { method: 'GET' });
};

export const updateSubject = async (id, subjectData) => {
  return await safeFetch(`${API_BASE_URL}/subjects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(subjectData),
  });
};

export const deleteSubject = async (id) => {
  return await safeFetch(`${API_BASE_URL}/subjects/${id}`, { method: 'DELETE' });
};

// ================= TOPICS =================
export const getTopics = async (subjectId) => {
  return await safeFetch(`${API_BASE_URL}/subjects/${subjectId}/topics`, { method: 'GET' });
};

export const createTopic = async (subjectId, topicData) => {
  return await safeFetch(`${API_BASE_URL}/subjects/${subjectId}/topics`, {
    method: 'POST',
    body: JSON.stringify(topicData),
  });
};

export const updateTopic = async (topicId, topicData) => {
  return await safeFetch(`${API_BASE_URL}/topics/${topicId}`, {
    method: 'PUT',
    body: JSON.stringify(topicData),
  });
};

export const deleteTopic = async (topicId) => {
  return await safeFetch(`${API_BASE_URL}/topics/${topicId}`, { method: 'DELETE' });
};

// ================= EXAMS =================
export const getExams = async () => {
  return await safeFetch(`${API_BASE_URL}/exams`, { method: 'GET' });
};

export const createExam = async (examData) => {
  return await safeFetch(`${API_BASE_URL}/exams`, {
    method: 'POST',
    body: JSON.stringify(examData),
  });
};

export const updateExam = async (id, examData) => {
  return await safeFetch(`${API_BASE_URL}/exams/${id}`, {
    method: 'PUT',
    body: JSON.stringify(examData),
  });
};

export const deleteExam = async (id) => {
  return await safeFetch(`${API_BASE_URL}/exams/${id}`, { method: 'DELETE' });
};

// ================= STUDY PLANS =================
export const generateStudyPlan = async (planConfig) => {
  return await safeFetch(`${API_BASE_URL}/study-plans/generate`, {
    method: 'POST',
    body: JSON.stringify(planConfig),
  });
};

export const getStudyPlans = async () => {
  return await safeFetch(`${API_BASE_URL}/study-plans`, { method: 'GET' });
};

export const getStudyPlanById = async (id) => {
  return await safeFetch(`${API_BASE_URL}/study-plans/${id}`, { method: 'GET' });
};

export const deleteStudyPlan = async (id) => {
  return await safeFetch(`${API_BASE_URL}/study-plans/${id}`, { method: 'DELETE' });
};

// ================= STUDY SESSIONS =================
export const getStudySessions = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return await safeFetch(`${API_BASE_URL}/study-sessions${query ? '?' + query : ''}`, { method: 'GET' });
};

export const getTodayStudySessions = async () => {
  return await safeFetch(`${API_BASE_URL}/study-sessions/today`, { method: 'GET' });
};

export const createStudySession = async (sessionData) => {
  return await safeFetch(`${API_BASE_URL}/study-sessions`, {
    method: 'POST',
    body: JSON.stringify(sessionData),
  });
};

export const updateStudySession = async (id, sessionData) => {
  return await safeFetch(`${API_BASE_URL}/study-sessions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(sessionData),
  });
};

export const deleteStudySession = async (id) => {
  return await safeFetch(`${API_BASE_URL}/study-sessions/${id}`, { method: 'DELETE' });
};

// ================= DASHBOARD & PROGRESS & PROFILE =================
export const getDashboardData = async () => {
  return await safeFetch(`${API_BASE_URL}/dashboard`, { method: 'GET' });
};

export const getProgressData = async () => {
  return await safeFetch(`${API_BASE_URL}/progress`, { method: 'GET' });
};

export const getProfile = async () => {
  return await safeFetch(`${API_BASE_URL}/profile`, { method: 'GET' });
};

export const updateProfile = async (profileData) => {
  return await safeFetch(`${API_BASE_URL}/profile`, {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
};
