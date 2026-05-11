import { normalizeProduct, normalizeProducts } from '../models/productModel';
import { getAuthHeader, API_BASE_URL as BASE_URL } from './AuthService';
import { handleAuthError } from './AuthErrorHandler';

const API_BASE_URL = `${BASE_URL}/products`;

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
    console.error('API Error:', response.status, message);
    throw new Error(message);
  }

  return data;
};

export const getProducts = async (signal) => {
  const response = await fetch(API_BASE_URL, {
    headers: {
      ...getAuthHeader()
    },
    credentials: 'omit',
    signal
  });
  const data = await handleResponse(response);
  return normalizeProducts(data);
};

export const getProductById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    headers: {
      ...getAuthHeader()
    },
    credentials: 'include'
  });
  const data = await handleResponse(response);
  return normalizeProduct(data);
};

export const getProductDetails = async (id, signal) => {
  const response = await fetch(`${API_BASE_URL}/${id}/details`, {
    headers: {
      ...getAuthHeader()
    },
    credentials: 'omit',
    signal
  });
  const data = await handleResponse(response);
  // normalizeProduct for the internal product object if needed, but the response structure is different now
  // data = { product, reviews, averageRating, isWishlisted }
  if (data.product) {
    data.product = normalizeProduct(data.product);
  }
  return data;
};

export const getRecommendedProducts = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}/recommendations`, {
    headers: {
      ...getAuthHeader()
    },
    credentials: 'omit'
  });
  const data = await handleResponse(response);
  return normalizeProducts(data);
};

export const getRecommendedOnlyProducts = async (signal) => {
  const response = await fetch(`${API_BASE_URL}/recommended-only`, {
    headers: {
      ...getAuthHeader()
    },
    credentials: 'omit',
    signal
  });
  const data = await handleResponse(response);
  return normalizeProducts(data);
};

export const searchProducts = async (query) => {
  const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`, {
    headers: {
      ...getAuthHeader()
    },
    credentials: 'omit'
  });
  const data = await handleResponse(response);
  return normalizeProducts(data);
};

export const createProduct = async (payload) => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    credentials: 'omit',
    body: JSON.stringify(payload)
  });

  const data = await handleResponse(response);
  return normalizeProduct(data);
};

export const updateProduct = async (id, payload) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    credentials: 'omit',
    body: JSON.stringify(payload)
  });

  const data = await handleResponse(response);
  return normalizeProduct(data);
};

export const deleteProduct = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeader()
    },
    credentials: 'omit'
  });

  if (!response.ok) {
    throw new Error('Request failed');
  }
};
