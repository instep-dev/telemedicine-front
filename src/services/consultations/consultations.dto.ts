export type SessionType = "SCHEDULED" | "INSTANT";
export type ConsultationMode = "VIDEO" | "VOICE";
export type SessionStatus = "CREATED" | "IN_CALL" | "COMPLETED" | "FAILED";

export type ConsultationSessionDto = {
  sessionId: string;
  sessionType: SessionType;
  consultationMode: ConsultationMode;
  sessionStatus: SessionStatus;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string | null;
  durationMinutes: number | null;
  doctorId: string;
  doctorName: string | null;
  patientId: string;
  patientName: string | null;
  createdBy: string;
  createdByName: string | null;
  doctorJoinedAt: string | null;
  patientJoinedAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  roomName: string;
  canDoctorJoin: boolean;
  canPatientJoin: boolean;
  doctorJoinState: "JOIN" | "JOINED" | "DISABLED";
  patientJoinState: "JOIN" | "JOINED" | "DISABLED";
  consultationNote: {
    id: string;
    aiStatus: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateConsultationSessionBody = {
  doctorId: string;
  patientId: string;
  sessionType: SessionType;
  consultationMode: ConsultationMode;
  scheduledDate?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
};

export type ListConsultationSessionsParams = {
  date?: string;
  status?: SessionStatus;
  sort?: "newest" | "oldest";
  search?: string;
};

export type DoctorOptionDto = {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  license: string;
};

export type PatientOptionDto = {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
};

export type ConsultationSessionNoteDto = {
  id: string;
  consultationSessionId: string;
  doctorId: string;
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
};

