import { getAuthHeader, API_BASE_URL as BASE_URL } from './AuthService';
import { handleAuthError } from './AuthErrorHandler';

const API_BASE_URL = `${BASE_URL}/reviews`;

const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch {
    // If not JSON, try to get text
    data = { message: await response.text() };
  }

  if (!response.ok) {
    handleAuthError(response.status);
    const message = data?.message || data?.toString?.() || 'Request failed';
    console.error('Review API error:', response.status, message, data);
    throw new Error(message);
  }
  return data;
};

export const getProductReviews = async (productId) => {
  const response = await fetch(`${API_BASE_URL}/product/${productId}`, {
    headers: {
      ...getAuthHeader()
    },
    credentials: 'omit'
  });
  return handleResponse(response);
};

export const getProductAverageRating = async (productId) => {
  const response = await fetch(`${API_BASE_URL}/product/${productId}/average-rating`, {
    headers: {
      ...getAuthHeader()
    },
    credentials: 'omit'
  });
  return handleResponse(response);
};

export const getAverageRatings = async (productIds, signal) => {
  if (!productIds || productIds.length === 0) {
    return {};
  }

  const params = new URLSearchParams();
  productIds.forEach((id) => params.append('ids', id));

  const response = await fetch(`${API_BASE_URL}/average-ratings?${params.toString()}`, {
    headers: {
      ...getAuthHeader()
    },
    credentials: 'omit',
    signal
  });
  return handleResponse(response);
};

export const addReview = async (productId, payload) => {
  const response = await fetch(`${API_BASE_URL}/product/${productId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    credentials: 'omit',
    body: JSON.stringify(payload)
  });
  return handleResponse(response);
};

export const updateReview = async (reviewId, payload) => {
  const response = await fetch(`${API_BASE_URL}/${reviewId}`, {
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

export const deleteReview = async (reviewId) => {
  const response = await fetch(`${API_BASE_URL}/${reviewId}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeader()
    },
    credentials: 'omit'
  });

  if (!response.ok) {
    throw new Error('Failed to delete review');
  }
};
