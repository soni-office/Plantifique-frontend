import { apiClient } from './axios';
import type { LoginResponse, SessionResponse, User } from '../types/auth';

export const authApi = {
  async getTikTokShopLoginUrl() {
    const { data } = await apiClient.get<LoginResponse>('/auth/tiktokshop/login');
    return data;
  },

  async getCurrentUser() {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },

  async logout() {
    await apiClient.post('/auth/logout');
  },

  async exchangeSessionFromCallback(code: string, state: string) {
    const { data } = await apiClient.post<SessionResponse>('/auth/tiktokshop/exchange', {
      code,
      state,
    });
    return data;
  },
};
