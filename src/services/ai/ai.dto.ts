export type GetAiResultsParams = {
  cursor?: string;
  limit?: number;
  search?: string;
  sort?: "newest" | "oldest";
};

export type AiResultItemDto = {
  id: string;
  consultationId: string;
  doctorId: string | null;
  doctorName: string | null;
  roomName: string | null;
  patientIdentity: string | null;
  consultationStatus: string;
  consultationStartedAt: string | null;
  consultationEndedAt: string | null;
  summary: string | null;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  transcriptRaw: string | null;
  aiStatus: string | null;
  aiError: string | null;
  transcribedAt: string | null;
  summarizedAt: string | null;
  aiModel: string | null;
  callSession: {
    id: string;
    durationSec: number | null;
    status: string | null;
    roomSid: string | null;
    roomName: string | null;
    createdAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type GetAiResultsResponse = {
  data: AiResultItemDto[];
  pagination: {
    limit: number;
    nextCursor: string | null;
    hasMore: boolean;
    sort: "newest" | "oldest";
    search: string | null;
  };
};

export type GetAiResultDetailResponse = {
  id: string;
  consultationId: string;
  doctorId: string | null;
  doctorName: string | null;
  roomName: string | null;
  patientIdentity: string | null;
  consultationStatus: string;
  consultationStartedAt: string | null;
  consultationEndedAt: string | null;
  summary: string | null;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  transcriptRaw: string | null;
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