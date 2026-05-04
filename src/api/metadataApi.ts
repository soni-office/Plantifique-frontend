import { apiClient } from "./axios";

export interface MetricDescriptions {
  creator: Record<string, string>;
  product: Record<string, string>;
}

export const metadataApi = {
  async getMetricDescriptions(): Promise<MetricDescriptions> {
    const { data } = await apiClient.get("/tiktok/metadata/metric-descriptions");
    return data;
  },
};
