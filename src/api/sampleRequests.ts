import { apiClient } from './axios';

export const sampleRequestsApi = {
  async getSampleRequests(shop_cipher: string, page_size = 20) {
    const { data } = await apiClient.get(
      `/tiktok/sample_request/search?shop_cipher=${shop_cipher}&page_size=${page_size}`
    );
    return data;
  },
};
