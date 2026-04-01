import { http } from "@/services/api/axios";
import type {
  CallItemDto,
  GetCallsParams,
  GetCallsResponse,
  GetCallDetailResponse,
  GetCallStatsParams,
  CallStatsResponse,
} from "./history.dto";

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

  async getAllCalls(
    accessToken: string,
    params: Omit<GetCallsParams, "cursor" | "limit"> = {},
  ): Promise<CallItemDto[]> {
    const limit = 100;
    let cursor: string | undefined = undefined;
    let hasMore = true;
    const items: CallItemDto[] = [];

    while (hasMore) {
      const res = await historyApi.getCalls(accessToken, {
        ...params,
        limit,
        cursor,
      });

      const pageItems = Array.isArray(res.data) ? res.data : [];
      items.push(...pageItems);

      hasMore = !!res.pagination.hasMore && !!res.pagination.nextCursor;
      cursor = res.pagination.nextCursor ?? undefined;

      if (pageItems.length === 0) {
        break;
      }
    }

    return items;
  },

  async getCallById(accessToken: string, id: string): Promise<GetCallDetailResponse> {
    const res = await http.get<GetCallDetailResponse>(`/call/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return res.data;
  },

  async getCallStats(
    accessToken: string,
    params: GetCallStatsParams,
  ): Promise<CallStatsResponse> {
    const res = await http.get<CallStatsResponse>("/call/statistics", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });

    return res.data;
  },
};
