import { apiClient } from "./axios";

export const THRESHOLD_KEYS = [
  "min_last_30_days_gmv",
  "min_follower_count",
  "min_post_rate",
  "min_content_count",
  "min_ec_video_views",
] as const;

export type ThresholdKey = (typeof THRESHOLD_KEYS)[number];
export type Thresholds = Partial<Record<ThresholdKey, number | null>>;

export interface TierCreator {
  id: string;       // username
  username: string;
  creator_open_id: string;
  avatar_url?: string;
  tier: "TIER_1" | "TIER_2";
  added_by: string;
  added_at: string;
}

export interface TierProduct {
  id: string;       // product_id
  tier: "TIER_3" | "TIER_4";
  title: string;
  sku_image_url?: string;
  price?: string;
  currency?: string;
  category?: string;
  thresholds: Thresholds;
  added_by: string;
  updated_at: string;
}

export interface ShopProduct {
  id: string;
  title: string;
  image_url: string;
  price: string;
  currency: string;
  status: string;
  category: string;
}

export const tierConfigApi = {
  // ── Creators ──────────────────────────────────────────────────────────
  async listCreators(tier?: string): Promise<TierCreator[]> {
    const { data } = await apiClient.get("/config/tier/creators", { params: tier ? { tier } : {} });
    return data.creators;
  },
  async addCreator(username: string, tier: "TIER_1" | "TIER_2"): Promise<TierCreator> {
    const { data } = await apiClient.post("/config/tier/creators", { username, tier });
    return data;
  },
  async removeCreator(username: string): Promise<void> {
    await apiClient.delete(`/config/tier/creators/${encodeURIComponent(username)}`);
  },

  // ── Products ───────────────────────────────────────────────────────────
  async listShopProducts(): Promise<ShopProduct[]> {
    const { data } = await apiClient.get("/config/tier/products/shop");
    return data.products;
  },
  async listTierProducts(tier?: string): Promise<TierProduct[]> {
    const { data } = await apiClient.get("/config/tier/products", { params: tier ? { tier } : {} });
    return data.products;
  },
  async addProduct(
    product_id: string,
    tier: "TIER_3" | "TIER_4",
    thresholds: Thresholds,
  ): Promise<TierProduct> {
    const { data } = await apiClient.post("/config/tier/products", { product_id, tier, thresholds });
    return data;
  },
  async updateThresholds(product_id: string, thresholds: Thresholds): Promise<TierProduct> {
    const { data } = await apiClient.patch(
      `/config/tier/products/${product_id}/thresholds`,
      { thresholds },
    );
    return data;
  },
  async removeProduct(product_id: string): Promise<void> {
    await apiClient.delete(`/config/tier/products/${product_id}`);
  },

  // ── Tier 5 ────────────────────────────────────────────────────────────
  async getTier5(): Promise<Thresholds> {
    const { data } = await apiClient.get("/config/tier/tier5");
    return data.thresholds;
  },
  async setTier5(thresholds: Thresholds): Promise<Thresholds> {
    const { data } = await apiClient.put("/config/tier/tier5", { thresholds });
    return data.thresholds;
  },
};
