import { http } from "@/services/api/axios";
import type {
  ConsultationSessionDto,
  ConsultationSessionNoteDto,
  CreateConsultationSessionBody,
  DoctorOptionDto,
  ListConsultationSessionsParams,
  NurseOptionDto,
  PatientOptionDto,
} from "./consultations.dto";

export const consultationsApi = {
  createSession: async (
    accessToken: string,
    body: CreateConsultationSessionBody,
  ) => {
    const res = await http.post<ConsultationSessionDto>("/consultations/sessions", body, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data;
  },

  listAdminSessions: async (accessToken: string, params?: ListConsultationSessionsParams) => {
    const res = await http.get<ConsultationSessionDto[]>("/consultations/sessions/admin", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params,
    });
    return res.data;
  },

  listAdminHistorySessions: async (
    accessToken: string,
    params?: ListConsultationSessionsParams,
  ) => {
    const res = await http.get<ConsultationSessionDto[]>(
      "/consultations/sessions/admin/history",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params,
      },
    );
    return res.data;
  },

  listDoctorSessions: async (
    accessToken: string,
    params?: ListConsultationSessionsParams,
  ) => {
    const res = await http.get<ConsultationSessionDto[]>("/consultations/sessions/doctor", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params,
    });
    return res.data;
  },

  listPatientSessions: async (
    accessToken: string,
    params?: ListConsultationSessionsParams,
  ) => {
    const res = await http.get<ConsultationSessionDto[]>("/consultations/sessions/patient", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params,
    });
    return res.data;
  },

  getSessionById: async (accessToken: string, sessionId: string) => {
    const res = await http.get<ConsultationSessionDto>(`/consultations/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data;
  },

  getSessionNoteById: async (accessToken: string, sessionId: string) => {
    const res = await http.get<ConsultationSessionNoteDto | null>(
      `/consultations/sessions/${sessionId}/note`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    return res.data;
  },

  listDoctors: async (accessToken: string) => {
    const res = await http.get<DoctorOptionDto[]>("/consultations/lookups/doctors", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data;
  },

  listPatients: async (accessToken: string) => {
    const res = await http.get<PatientOptionDto[]>("/consultations/lookups/patients", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data;
  },

  listNurses: async (accessToken: string) => {
    const res = await http.get<NurseOptionDto[]>("/consultations/lookups/nurses", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data;
  },

  listNurseSessions: async (
    accessToken: string,
    params?: ListConsultationSessionsParams,
  ) => {
    const res = await http.get<ConsultationSessionDto[]>("/consultations/sessions/nurse", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params,
    });
    return res.data;
  },
};
