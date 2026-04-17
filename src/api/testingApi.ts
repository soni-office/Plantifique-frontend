import { apiClient } from "./axios";

export interface AestheticTestResult {
  status: string;
  product_title?: string;
  tier?: string;
  creator_username?: string;
  videos_analyzed?: number;
  // Phase 3
  aesthetic_score?: number;
  aesthetic_reasoning?: string;
  top_3_video_urls?: string[];
  // Phase 4
  visual_score?: number;
  visual_reasoning?: string;
  matched_patterns?: string[];
  missing_patterns?: string[];
  videos_downloaded_for_analysis?: number;
  rubric_applied?: string;
  message?: string;
}

export const testingApi = {
  async evaluateAesthetic(productId: string, creatorUsername: string): Promise<AestheticTestResult> {
    const { data } = await apiClient.post("/tiktok/testing/evaluate-aesthetic", {
      product_id: productId,
      creator_username: creatorUsername,
    });
    return data;
  },
};
