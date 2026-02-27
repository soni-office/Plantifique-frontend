import { apiClient } from "./axios";

export const creatorsApi = {
  async getCreatorByUsername(username: string) {
    const { data } = await apiClient.get(
      "/tiktok/creators/creators",
      { params: { keyword: username } }
    );

    const candidate =
      data?.data?.creators?.[0] ??
      data?.data?.creator ??
      data?.creators?.[0] ??
      data?.creator ??
      (Array.isArray(data) ? data[0] : null) ??
      (Array.isArray(data?.data) ? data.data[0] : null) ??
      data?.data ??
      data;

    if (candidate && typeof candidate === "object") {
      return candidate;
    }

    return null;
  },
};
