import { useQuery } from "@tanstack/react-query";
import { historyApi } from "./history.api";
import type { GetCallsParams } from "./history.dto";

export function useCallsQuery(
  accessToken: string | null,
  params: GetCallsParams,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["calls", params],
    queryFn: () => {
      if (!accessToken) throw new Error("No access token");
      return historyApi.getCalls(accessToken, params);
    },
    enabled: !!accessToken && enabled,
    retry: false,
  });
}

export function useCallDetailQuery(
  accessToken: string | null,
  id: string,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["call-detail", id],
    queryFn: () => {
      if (!accessToken) throw new Error("No access token");
      return historyApi.getCallById(accessToken, id);
    },
    enabled: !!accessToken && !!id && enabled,
    retry: false,
  });
}