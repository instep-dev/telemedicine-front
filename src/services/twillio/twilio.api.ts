import { http } from "@/services/api/axios";
import type {
  DoctorTokenBody,
  DoctorTokenResponse,
  GuestTokenBody,
  GuestTokenResponse,
  EndCallResponse,
  CallSessionResultResponse,
  VideoTranscriptionPayload,
} from "./twilio.dto";

export const twilioApi = {
  getDoctorToken: async (accessToken: string, body: DoctorTokenBody) => {
    const res = await http.post<DoctorTokenResponse>("/twilio/video/doctor-token", body, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data;
  },

  getGuestToken: async (body: GuestTokenBody) => {
    const res = await http.post<GuestTokenResponse>("/twilio/video/guest-token", body);
    return res.data;
  },

  endCall: async (accessToken: string, consultationId: string) => {
    const res = await http.post<EndCallResponse>(
      `/twilio/video/end/${consultationId}`,
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    return res.data;
  },

  getCallResult: async (accessToken: string, consultationId: string) => {
    const res = await http.get<CallSessionResultResponse>(
      `/twilio/video/result/${consultationId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    return res.data;
  },

  sendTranscription: async (accessToken: string, payload: VideoTranscriptionPayload) => {
    const res = await http.post(
      `/twilio/video/transcription`,
      payload,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    return res.data;
  },
};
