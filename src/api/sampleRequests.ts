import { apiClient } from './axios';

export const sampleRequestsApi = {
  async getSampleRequests( page_size = 20) {
    const { data } = await apiClient.get(
      `/tiktok/sample_request/search?page_size=${page_size}`
    );
    return data;
  },
};
