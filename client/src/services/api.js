// Minimal Frontend API Utility for Authentication
import { getToken } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const safeFetch = async (url, options) => {
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    throw new Error(
      'Unable to connect to the backend server. Please make sure the server is running on port 5000.'
    );
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
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
};

export const register = async ({ name, email, password }) => {
  return await safeFetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });
};

export const login = async ({ email, password }) => {
  return await safeFetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
};

export const getCurrentUser = async () => {
  const token = getToken();

  return await safeFetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
};
