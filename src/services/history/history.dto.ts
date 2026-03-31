export type GetCallsParams = {
  cursor?: string;
  limit?: number;
  search?: string;
  sort?: "newest" | "oldest";
};

export type CallItemDto = {
  id: string;
  consultationId: string;
  doctorId: string | null;
  doctorName: string | null;
  patientName: string | null;
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
  consultationStatus: string;
  consultationStartedAt: string | null;
  consultationEndedAt: string | null;
  patientCity: string | null;
  patientProvince: string | null;
  patientCountry: string | null;
  patientCountryCode: string | null;
  patientLatitude: number | null;
  patientLongitude: number | null;
  createdAt: string;
  updatedAt: string;
};

export type GetCallsResponse = {
  data: CallItemDto[];
  pagination: {
    limit: number;
    nextCursor: string | null;
    hasMore: boolean;
    sort: "newest" | "oldest";
    search: string | null;
  };
};

export type GetCallDetailResponse = {
  id: string;
  consultationId: string;
  doctorId: string | null;
  doctorName: string | null;
  consultationStatus: string;
  roomName: string | null;
  consultationStartedAt: string | null;
  consultationEndedAt: string | null;
  transcriptRaw: string | null;
  summary: string | null;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  aiStatus: string | null;
  aiError: string | null;
  transcribedAt: string | null;
  summarizedAt: string | null;
  aiModel: string | null;
  createdAt: string;
  updatedAt: string;
  callSession: {
    id: string;
    status: string;
    roomSid: string | null;
    roomName: string | null;
    doctorIdentity: string | null;
    patientIdentity: string | null;
    startedAt: string | null;
    endedAt: string | null;
    recordingStatus: string | null;
    compositionStatus: string | null;
    mediaUrl: string | null;
    mediaFormat: string | null;
    durationSec: number | null;
    errorMessage: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
};
