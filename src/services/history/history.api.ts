import { http } from "@/services/api/axios";
import type { GetCallsParams, GetCallsResponse, GetCallDetailResponse } from "./history.dto";

export const historyApi = {
  async getCalls(accessToken: string, params: GetCallsParams): Promise<GetCallsResponse> {
    const res = await http.get<GetCallsResponse>("/call", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });

    return res.data;
  },

  async getCallById(accessToken: string, id: string): Promise<GetCallDetailResponse> {
    const res = await http.get<GetCallDetailResponse>(`/call/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return res.data;
  },
};