import { getAuthHeader, API_BASE_URL as BASE_URL } from './AuthService';
import { handleAuthError } from './AuthErrorHandler';

const API_BASE_URL = `${BASE_URL}/users`;

const handleResponse = async (response) => {
  let data;
  const contentType = response.headers.get('content-type');

  try {
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }
  } catch (e) {
    data = { message: 'Invalid response format' };
  }

  if (!response.ok) {
    handleAuthError(response.status);
    const message = data?.message || data?.error || `Request failed (${response.status})`;
    console.error('User API Error:', response.status, message);
    throw new Error(message);
  }

  return data;
};

export const getUsers = async () => {
  const response = await fetch(API_BASE_URL, {
    headers: {
      ...getAuthHeader()
    },
    credentials: 'omit'
  });

  return handleResponse(response);
};

export const getUserById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    headers: {
      ...getAuthHeader()
    },
    credentials: 'omit'
  });

  return handleResponse(response);
};

export const getMyProfile = async (signal) => {
  const response = await fetch(`${API_BASE_URL}/me`, {
    headers: {
      ...getAuthHeader()
    },
    credentials: 'omit',
    signal
  });

  return handleResponse(response);
};

export const updateMyProfile = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    credentials: 'omit',
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const updateUser = async (id, payload) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    credentials: 'omit',
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};
