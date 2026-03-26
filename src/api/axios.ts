import axios from 'axios';
import { firebaseAuth } from '../lib/firebase';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach a fresh Firebase ID token on every request.
// getIdToken() auto-refreshes the token when within 5 minutes of expiry — no manual refresh needed.
apiClient.interceptors.request.use(async (config) => {
  const user = firebaseAuth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      window.dispatchEvent(new Event('app:unauthorized'));
    }
    return Promise.reject(error);
  },
);
