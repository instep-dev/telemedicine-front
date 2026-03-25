import { useQuery } from "@tanstack/react-query";
import { aiApi } from "./ai.api";
import type { GetAiResultsParams } from "./ai.dto";

export function useAiResultsQuery(
  accessToken: string | null,
  params: GetAiResultsParams,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["ai-results", params],
    queryFn: () => {
      if (!accessToken) throw new Error("No access token");
      return aiApi.getAiResults(accessToken, params);
    },
    enabled: !!accessToken && enabled,
    retry: false,
  });
}

export function useAiResultDetailQuery(
  accessToken: string | null,
  id: string,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["ai-result-detail", id],
    queryFn: () => {
      if (!accessToken) throw new Error("No access token");
      return aiApi.getAiResultById(accessToken, id);
    },
    enabled: !!accessToken && !!id && enabled,
    retry: false,
  });
}