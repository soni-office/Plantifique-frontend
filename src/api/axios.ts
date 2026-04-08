import axios from 'axios';
import { firebaseAuth } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach a fresh Firebase ID token on every request.
// If the SUPER_ADMIN has selected an active org, also attach X-Active-Org.
apiClient.interceptors.request.use(async (config) => {
  const firebaseUser = firebaseAuth.currentUser;
  if (firebaseUser) {
    const token = await firebaseUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }

  const { activeOrgId } = useAuthStore.getState();
  if (activeOrgId) {
    config.headers['X-Active-Org'] = activeOrgId;
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
