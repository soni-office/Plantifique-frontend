import { apiClient } from "./axios";

export const creatorsApi = {
  // NEW METHOD: Call backend using the verified creator_open_id
  async getCreatorByOpenId(creatorOpenId: string) {
    const { data } = await apiClient.get(
      `/tiktok/creators/creators/${creatorOpenId}`
    );

    const candidate =
      data?.data?.creator ??
      data?.data?.creators?.[0] ??
      (Array.isArray(data) ? data[0] : null) ??
      (Array.isArray(data?.data) ? data.data[0] : null) ??
      data?.data ??
      data;

    if (candidate && typeof candidate === "object") {
      return {
        ...candidate,
        internal_guidelines: data?.internal_guidelines,
      };
    }

    return null;
  },

  // OLD METHOD: Kept just in case anything else still needs it
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
      return {
        ...candidate,
        internal_guidelines: data?.internal_guidelines,
      };
    }

    return null;
  },
};
