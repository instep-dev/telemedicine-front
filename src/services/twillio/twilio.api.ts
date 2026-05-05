import { http } from "@/services/api/axios";
import type {
  CallSessionResultResponse,
  DoctorTokenBody,
  DoctorTokenResponse,
  EndCallResponse,
  NurseTokenBody,
  NurseTokenResponse,
  PatientTokenBody,
  PatientTokenResponse,
  VideoTranscriptionPayload,
} from "./twilio.dto";

export const twilioApi = {
  getDoctorToken: async (accessToken: string, body: DoctorTokenBody) => {
    const res = await http.post<DoctorTokenResponse>("/twilio/video/doctor-token", body, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data;
  },

  getNurseToken: async (accessToken: string, body: NurseTokenBody) => {
    const res = await http.post<NurseTokenResponse>("/twilio/video/nurse-token", body, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data;
  },

  getPatientToken: async (accessToken: string, body: PatientTokenBody) => {
    const res = await http.post<PatientTokenResponse>("/twilio/video/patient-token", body, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data;
  },

  endCall: async (accessToken: string, sessionId: string) => {
    const res = await http.post<EndCallResponse>(
      `/twilio/video/end/${sessionId}`,
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    return res.data;
  },

  getCallResult: async (accessToken: string, sessionId: string) => {
    const res = await http.get<CallSessionResultResponse>(
      `/twilio/video/result/${sessionId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    return res.data;
  },

  sendTranscription: async (accessToken: string, payload: VideoTranscriptionPayload) => {
    const res = await http.post(`/twilio/video/transcription`, payload, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data;
  },
};

