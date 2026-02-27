import { apiClient } from "./axios";
import type { ProductDetails } from "../types/product";

export const productsApi = {
  async getProductById(productId: string): Promise<ProductDetails | null> {
    const { data } = await apiClient.get(`/tiktok/products/${productId}`);

    if (data?.code === 0 && data?.data) {
      return data.data as ProductDetails;
    }

    if (data?.id) {
      return data as ProductDetails;
    }

    return null;
  },
};
