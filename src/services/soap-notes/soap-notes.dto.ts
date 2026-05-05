export type SoapNoteDto = {
  id: string;
  consultationSessionId: string;
  doctorId: string;
  patientId: string;
  nurseId: string | null;
  doctorName: string | null;
  patientName: string | null;
  nurseName: string | null;
  scheduledStartTime: string | null;
  scheduledEndTime: string | null;
  durationMinutes: number | null;
  sessionStatus: string | null;
  consultationMode: string | null;
  sessionType: string | null;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  summary: string | null;
  aiStatus: string | null;
  aiError: string | null;
  isFinalized: boolean;
  finalizedAt: string | null;
  transcribedAt: string | null;
  summarizedAt: string | null;
  aiModel: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateSoapNoteBody = {
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
};

export type SseNoteEvent =
  | { type: "NOTE_UPDATED"; note: SoapNoteDto }
  | { type: "PENDING_FINALIZATION" };
