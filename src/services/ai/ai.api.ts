import { http } from "@/services/api/axios";
import type {
  GetAiResultsParams,
  GetAiResultsResponse,
  GetAiResultDetailResponse,
  RetryAiSummaryResponse,
} from "./ai.dto";

export const aiApi = {
  async getAiResults(
    accessToken: string,
    params: GetAiResultsParams,
  ): Promise<GetAiResultsResponse> {
    const res = await http.get<GetAiResultsResponse>("/ai-results", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });

    return res.data;
  },

  async getAiResultById(
    accessToken: string,
    id: string,
  ): Promise<GetAiResultDetailResponse> {
    const res = await http.get<GetAiResultDetailResponse>(`/ai-results/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return res.data;
  },

  async retryAiSummary(
    accessToken: string,
    consultationId: string,
  ): Promise<RetryAiSummaryResponse> {
    const res = await http.post<RetryAiSummaryResponse>(
      `/ai/retry/${consultationId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return res.data;
  },
};
