export type DoctorTokenBody = {
  consultationId: string;
};

export type DoctorTokenResponse = {
  token: string;
  roomName: string;
  identity: string;
  consultationId: string;
};

export type GuestTokenBody = {
  linkToken: string;
  displayName: string;
  clientIp?: string | null;
};

export type GuestTokenResponse = {
  token: string;
  roomName: string;
  identity: string;
  consultationId: string;
  doctorName: string;
  displayName: string;
};

export type EndCallResponse = {
  success: boolean;
  consultationId: string;
  roomSid: string;
  status: string;
};

export type CallSessionResultResponse = {
  consultationId: string;
  consultationStatus: string;
  callSession: {
    id: string;
    consultationId: string;
    status: "STARTED" | "CONNECTED" | "RECORDING_READY" | "COMPLETED" | "FAILED";
    roomSid: string | null;
    roomName: string | null;
    doctorIdentity: string | null;
    patientIdentity: string | null;
    startedAt: string | null;
    endedAt: string | null;
    recordingEnabled: boolean;
    recordingStatus: string | null;
    recordingStartedAt: string | null;
    recordingCompletedAt: string | null;
    compositionSid: string | null;
    compositionStatus: string | null;
    compositionStartedAt: string | null;
    compositionReadyAt: string | null;
    mediaUrl: string | null;
    mediaFormat: string | null;
    durationSec: number | null;
    errorMessage: string | null;
    createdAt: string;
    updatedAt: string;
  };
  playableUrl: string | null;
};
