import { handleAuthError } from './AuthErrorHandler';

export const API_BASE_URL = 'http://localhost:8080/api';
const AUTH_URL = `${API_BASE_URL}/auth`;
const AUTH_MARKER_KEY = 'ecommerce-auth-known';
const CURRENT_USER_KEY = 'ecommerce-current-user';
const TOKEN_KEY = 'ecommerce-auth-token';

const canUseStorage = () => typeof window !== 'undefined' && window.localStorage;

const setToken = (token) => {
  if (!canUseStorage()) {
    return;
  }
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
    console.log('Token stored in localStorage');
  } else {
    window.localStorage.removeItem(TOKEN_KEY);
  }
};

const getToken = () => {
  if (!canUseStorage()) {
    return null;
  }
  return window.localStorage.getItem(TOKEN_KEY);
};

export const getAuthHeader = () => {
  const token = getToken();
  if (!token) {
    return {};
  }
  return { 'Authorization': `Bearer ${token}` };
};

const setAuthMarker = (value) => {
  if (!canUseStorage()) {
    return;
  }

  if (value) {
    console.log('Setting auth marker in localStorage');
    window.localStorage.setItem(AUTH_MARKER_KEY, 'true');
  } else {
    console.log('Clearing auth marker from localStorage');
    window.localStorage.removeItem(AUTH_MARKER_KEY);
    window.localStorage.removeItem(CURRENT_USER_KEY);
  }
};

const getAuthMarker = () => {
  if (!canUseStorage()) {
    return false;
  }

  const marker = window.localStorage.getItem(AUTH_MARKER_KEY) === 'true';
  console.log('Auth marker from localStorage:', marker);
  return marker;
};

const setCachedUser = (user) => {
  if (!canUseStorage()) {
    return;
  }

  if (user) {
    window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(CURRENT_USER_KEY);
  }
};

const getCachedUser = () => {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const cached = window.localStorage.getItem(CURRENT_USER_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

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
    console.error('Auth API Error:', response.status, message);
    throw new Error(message);
  }
  return data;
};

export const login = async (payload) => {
  const response = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'omit',
    body: JSON.stringify(payload)
  });

  const data = await handleResponse(response);
  console.log('Login successful, setting auth marker and caching user');
  if (data?.token) {
    setToken(data.token);
    console.log('JWT token stored from login response');
  }
  setAuthMarker(true);
  setCachedUser(data);
  return data;
};

export const signup = async (payload) => {
  const response = await fetch(`${AUTH_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'omit',
    body: JSON.stringify(payload)
  });

  const data = await handleResponse(response);
  console.log('Signup successful, setting auth marker and caching user');
  if (data?.token) {
    setToken(data.token);
    console.log('JWT token stored from signup response');
  }
  setAuthMarker(true);
  setCachedUser(data);
  return data;
};

export const logout = async () => {
  try {
    const response = await fetch(`${AUTH_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      credentials: 'omit'
    });

    try {
      await handleResponse(response);
    } catch (e) {
      console.warn('Backend logout failed or token expired, proceeding with local logout', e);
    }
  } catch (err) {
    console.warn('Network error during logout, proceeding with local logout', err);
  } finally {
    console.log('Logging out, clearing auth marker, cache, and token');
    setToken(null);
    setAuthMarker(false);
    setCachedUser(null);
  }
};

export const getMe = async () => {
  if (!getAuthMarker()) {
    console.log('No auth marker, returning null');
    return null;
  }

  try {
    const response = await fetch(`${AUTH_URL}/me`, {
      method: 'GET',
      headers: {
        ...getAuthHeader()
      },
      credentials: 'omit'
    });

    if (response.status === 401 || response.status === 403) {
      console.log('Got 401/403 from /me endpoint, clearing auth');
      handleAuthError(response.status);
      return null;
    }

    const data = await handleResponse(response);
    console.log('getMe successful, caching user:', data);
    setCachedUser(data);
    return data;
  } catch (err) {
    console.error('getMe error:', err);
    // On error, clear auth state to force re-login
    console.log('Clearing auth state due to getMe error');
    handleAuthError(500);
    return null;
  }
};

export const getCachedUserData = () => {
  return getCachedUser();
};
