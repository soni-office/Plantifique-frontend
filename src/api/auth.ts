import { apiClient } from './axios';
import type { User } from '../types/auth';

export const authApi = {
  async getCurrentUser(): Promise<User> {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },

  /** Returns the TikTok OAuth URL; caller does window.location.href = url */
  async getTikTokConnectUrl(): Promise<string> {
    const { data } = await apiClient.get<{ auth_url: string }>('/auth/tiktokshop/connect');
    return data.auth_url;
  },

  async inviteUser(payload: {
    email: string;
    name?: string;
    role: string;
    org_id?: string;
  }): Promise<{ uid: string; email: string; role: string; email_sent: boolean; invite_link: string | null }> {
    const { data } = await apiClient.post('/auth/invite', payload);
    return data;
  },

  async setUserRole(uid: string, role: string): Promise<void> {
    await apiClient.post('/auth/set-role', { uid, role });
  },

  async listOrgUsers(): Promise<{ users: Array<{ id: string; email: string; name?: string; role: string }> }> {
    const { data } = await apiClient.get('/auth/users');
    return data;
  },

  async removeUser(uid: string): Promise<void> {
    await apiClient.delete(`/auth/users/${uid}`);
  },

  async getTikTokStatus(): Promise<{ connected: boolean }> {
    const { data } = await apiClient.get<{ connected: boolean }>('/auth/tiktokshop/status');
    return data;
  },

  async revokeTikTokAccess(): Promise<void> {
    await apiClient.delete('/auth/tiktokshop/revoke');
  },
};
