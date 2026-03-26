import { apiClient } from './axios';

export interface Org {
  id: string;
  name: string;
  status: string;
}

export const orgsApi = {
  async list(): Promise<Org[]> {
    const { data } = await apiClient.get<{ orgs: Org[] }>('/orgs');
    return data.orgs;
  },

  async create(name: string, org_id?: string): Promise<Org> {
    const { data } = await apiClient.post<Org>('/orgs', { name, org_id: org_id || '' });
    return data;
  },
};
