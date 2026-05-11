export type DoctorTokenBody = {
  sessionId: string;
};

export type NurseTokenBody = {
  sessionId: string;
};

export type NurseTokenResponse = TokenResponse;

export type PatientTokenBody = {
  sessionId: string;
  clientIp?: string | null;
};

export type TokenResponse = {
  token: string;
  roomName: string;
  identity: string;
  sessionId: string;
  consultationMode: "VIDEO" | "VOICE";
  sessionType: "SCHEDULED" | "INSTANT";
  participantNames?: Record<string, string>;
};

export type DoctorTokenResponse = TokenResponse;

export type PatientTokenResponse = TokenResponse & {
  doctorName: string;
  patientName: string;
};

export type EndCallResponse = {
  success: boolean;
  sessionId: string;
  roomSid: string | null;
  status: string;
  aiStatus?: string;
};

export type CallSessionResultResponse = {
  sessionId: string;
  sessionStatus: string;
  consultationMode: "VIDEO" | "VOICE";
  consultationSession: {
    sessionId: string;
    sessionStatus: string;
    roomName: string;
    twilioRoomSid: string | null;
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

export type VideoTranscriptionPayload = {
  sessionId: string;
  transcription: string;
  participant?: string;
  partialResults?: boolean;
  stability?: number;
  languageCode?: string;
  sequenceNumber?: number;
  timestamp?: string;
};

