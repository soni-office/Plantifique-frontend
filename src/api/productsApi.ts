import { apiClient } from "./axios";
import type { ProductDetails } from "../types/product";

export const productsApi = {
  async getProductById(productId: string): Promise<ProductDetails | null> {
    const { data } = await apiClient.get(`/tiktok/products/${productId}`);

    // Cache response: { data: {...}, source: 'cache' }
    // TikTok API response: { code: 0, data: {...}, ... }
    // Both nest the product under `data.data`
    if (data?.data?.id) {
      return data.data as ProductDetails;
    }

    // Direct product object (fallback)
    if (data?.id) {
      return data as ProductDetails;
    }

    return null;
  },
};
