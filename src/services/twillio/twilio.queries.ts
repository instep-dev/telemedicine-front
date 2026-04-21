import { useMutation } from "@tanstack/react-query";
import { twilioApi } from "./twilio.api";
import type { DoctorTokenBody, PatientTokenBody } from "./twilio.dto";

export function useDoctorTokenMutation(accessToken: string | null) {
  return useMutation({
    mutationFn: (body: DoctorTokenBody) => {
      if (!accessToken) throw new Error("No access token");
      return twilioApi.getDoctorToken(accessToken, body);
    },
  });
}

export function usePatientTokenMutation(accessToken: string | null) {
  return useMutation({
    mutationFn: (body: PatientTokenBody) => {
      if (!accessToken) throw new Error("No access token");
      return twilioApi.getPatientToken(accessToken, body);
    },
  });
}

export function useEndCallMutation(accessToken: string | null) {
  return useMutation({
    mutationFn: (sessionId: string) => {
      if (!accessToken) throw new Error("No access token");
      return twilioApi.endCall(accessToken, sessionId);
    },
  });
}

