import { apiClient } from "./axios";
import type { SampleApplication, SampleListResponse } from "../types/sampleRequest";

export const sampleRequestsApi = {
  /** Fetch a page from DB. Pass cursor=next_cursor from previous response for next page. */
  async getSampleRequests(
    pageSize = 30,
    cursor?: string | null,
  ): Promise<SampleListResponse> {
    const params: Record<string, unknown> = { page_size: pageSize };
    if (cursor) params.cursor = cursor;

    const { data } = await apiClient.get<SampleListResponse>("/tiktok/samples", { params });
    return data;
  },

  /** Pull all PENDING sample requests from TikTok and upsert into Firestore. */
  async syncSampleRequests(): Promise<{ new: number; updated: number; pages_fetched: number }> {
    const { data } = await apiClient.post("/tiktok/samples/sync");
    return data;
  },

  async analyzeSample(sampleId: string): Promise<SampleApplication> {
    const { data } = await apiClient.post(`/tiktok/samples/${sampleId}/evaluate`);
    return data.data;
  },

  async updateReviewStatus(sampleId: string, status: string): Promise<void> {
    await apiClient.patch(`/tiktok/samples/${sampleId}/review-status`, { status });
  },

  async submitFeedback(sampleId: string, rating: "up" | "down", comment = ""): Promise<void> {
    await apiClient.post(`/tiktok/samples/${sampleId}/feedback`, { rating, comment });
  },
};
