import { getAuthHeader, API_BASE_URL as BASE_URL } from './AuthService';
import { handleAuthError } from './AuthErrorHandler';

const API_BASE_URL = `${BASE_URL}/wishlists`;

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
    console.error('Wishlist API Error:', response.status, message);
    throw new Error(message);
  }

  return data;
};

export const getMyWishlist = async () => {
  const response = await fetch(API_BASE_URL, {
    headers: {
      ...getAuthHeader()
    },
    credentials: 'omit'
  });
  return handleResponse(response);
};

export const isInWishlist = async (productId) => {
  const response = await fetch(`${API_BASE_URL}/product/${productId}`, {
    headers: {
      ...getAuthHeader()
    },
    credentials: 'omit'
  });
  return handleResponse(response);
};

export const addToWishlist = async (productId) => {
  const response = await fetch(`${API_BASE_URL}/product/${productId}`, {
    method: 'POST',
    headers: {
      ...getAuthHeader()
    },
    credentials: 'omit'
  });
  return handleResponse(response);
};

export const removeFromWishlist = async (productId) => {
  const response = await fetch(`${API_BASE_URL}/product/${productId}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeader()
    },
    credentials: 'omit'
  });

  if (!response.ok) {
    handleAuthError(response.status);
    throw new Error(`Failed to remove from wishlist (${response.status})`);
  }
};
