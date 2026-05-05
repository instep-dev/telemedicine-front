import { useMutation, useQuery } from "@tanstack/react-query";
import { consultationsApi } from "./consultations.api";
import type {
  CreateConsultationSessionBody,
  ListConsultationSessionsParams,
} from "./consultations.dto";

export function useCreateConsultationSessionMutation(accessToken: string | null) {
  return useMutation({
    mutationFn: (body: CreateConsultationSessionBody) => {
      if (!accessToken) throw new Error("No access token");
      return consultationsApi.createSession(accessToken, body);
    },
  });
}

export function useAdminSessionsQuery(
  accessToken: string | null,
  params?: ListConsultationSessionsParams,
  enabled = true,
) {
  return useQuery({
    queryKey: ["consultation-sessions", "admin", params],
    queryFn: () => {
      if (!accessToken) throw new Error("No access token");
      return consultationsApi.listAdminSessions(accessToken, params);
    },
    enabled: !!accessToken && enabled,
  });
}

export function useAdminHistorySessionsQuery(
  accessToken: string | null,
  params?: ListConsultationSessionsParams,
  enabled = true,
) {
  return useQuery({
    queryKey: ["consultation-sessions", "admin", "history", params],
    queryFn: () => {
      if (!accessToken) throw new Error("No access token");
      return consultationsApi.listAdminHistorySessions(accessToken, params);
    },
    enabled: !!accessToken && enabled,
  });
}

export function useDoctorSessionsQuery(
  accessToken: string | null,
  params?: ListConsultationSessionsParams,
  enabled = true,
) {
  return useQuery({
    queryKey: ["consultation-sessions", "doctor", params],
    queryFn: () => {
      if (!accessToken) throw new Error("No access token");
      return consultationsApi.listDoctorSessions(accessToken, params);
    },
    enabled: !!accessToken && enabled,
  });
}

export function usePatientSessionsQuery(
  accessToken: string | null,
  params?: ListConsultationSessionsParams,
  enabled = true,
) {
  return useQuery({
    queryKey: ["consultation-sessions", "patient", params],
    queryFn: () => {
      if (!accessToken) throw new Error("No access token");
      return consultationsApi.listPatientSessions(accessToken, params);
    },
    enabled: !!accessToken && enabled,
  });
}

export function useNurseSessionsQuery(
  accessToken: string | null,
  params?: ListConsultationSessionsParams,
  enabled = true,
) {
  return useQuery({
    queryKey: ["consultation-sessions", "nurse", params],
    queryFn: () => {
      if (!accessToken) throw new Error("No access token");
      return consultationsApi.listNurseSessions(accessToken, params);
    },
    enabled: !!accessToken && enabled,
  });
}
