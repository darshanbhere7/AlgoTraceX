import axios from 'axios';

const normalizeBaseUrl = (value) => {
  if (!value) return '';
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

// In production (Vercel build), always point to Render backend.
// In development, allow overriding via VITE_API_BASE_URL, otherwise default to localhost.
const rawBaseUrl = import.meta.env.PROD
  ? 'https://algotracex.onrender.com/api'
  : import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const API_BASE_URL = normalizeBaseUrl(rawBaseUrl);

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const buildApiUrl = (path = '') => {
  if (!path) return API_BASE_URL;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

