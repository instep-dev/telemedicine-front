import { useMutation } from "@tanstack/react-query";
import { twilioApi } from "./twilio.api";
import type { DoctorTokenBody, GuestTokenBody } from "./twilio.dto";

export function useDoctorTokenMutation(accessToken: string | null) {
  return useMutation({
    mutationFn: (body: DoctorTokenBody) => {
      if (!accessToken) throw new Error("No access token");
      return twilioApi.getDoctorToken(accessToken, body);
    },
  });
}

export function useGuestTokenMutation() {
  return useMutation({
    mutationFn: (body: GuestTokenBody) => twilioApi.getGuestToken(body),
  });
}

export function useEndCallMutation(accessToken: string | null) {
  return useMutation({
    mutationFn: (consultationId: string) => {
      if (!accessToken) throw new Error("No access token");
      return twilioApi.endCall(accessToken, consultationId);
    },
  });
}