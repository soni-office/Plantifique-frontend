// import { apiClient } from "./axios";
// import type { SampleApplication, SampleRequestResponse } from "../types/sampleRequest";

// export const sampleRequestsApi = {
//   async getSampleRequests(pageSize = 20): Promise<SampleApplication[]> {
//     const { data } = await apiClient.get<SampleRequestResponse | { data?: { sample_requests?: SampleApplication[] }; sample_requests?: SampleApplication[] }>(
//       "/tiktok/samples/search",
//       { params: { page_size: pageSize } }
//     );

//     if (Array.isArray((data as SampleRequestResponse)?.data?.sample_applications)) {
//       return (data as SampleRequestResponse).data.sample_applications;
//     }

//     const nestedSampleRequests = (data as { data?: { sample_requests?: SampleApplication[] } })?.data?.sample_requests;
//     if (Array.isArray(nestedSampleRequests)) {
//       return nestedSampleRequests;
//     }

//     const rootSampleRequests = (data as { sample_requests?: SampleApplication[] })?.sample_requests;
//     if (Array.isArray(rootSampleRequests)) {
//       return rootSampleRequests;
//     }

//     return [];
//   },
// };


import { apiClient } from "./axios";
import type { SampleApplication } from "../types/sampleRequest";

export const sampleRequestsApi = {
  async getSampleRequests(pageSize = 20): Promise<SampleApplication[]> {
    const { data } = await apiClient.get(
      "/tiktok/samples/search",
      { params: { page_size: pageSize } }
    );

    // ✅ CASE 1: Backend returns ARRAY of full responses
    if (Array.isArray(data)) {
      return data.flatMap((item: any) =>
        item?.data?.sample_applications ?? []
      );
    }

    // ✅ CASE 2: Normal TikTok-style response
    if (Array.isArray(data?.data?.sample_applications)) {
      return data.data.sample_applications;
    }

    return [];
  },
  async analyzeSample(sampleId: string) {
    const { data } = await apiClient.post(
      `/agent/analyze/${sampleId}`
    );
    return data;
  },

};