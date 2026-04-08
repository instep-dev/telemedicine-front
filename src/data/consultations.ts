export type ConsultationStatus =
  | "CREATED"
  | "WAITING"
  | "IN_CALL"
  | "PROCESSING"
  | "DONE"
  | "FAILED"
  | "EXPIRED"

export type CallStatus =
  | "STARTED"
  | "CONNECTED"
  | "RECORDING_READY"
  | "COMPLETED"
  | "FAILED"

export type ConsultationNote = {
  transcript?: string | null
  summary?: string | null
  soapJson?: {
    subjective?: string
    objective?: string
    assessment?: string
    plan?: string
  } | null
  transcribedAt?: string | null
  summarizedAt?: string | null
  aiModel?: string | null
}

export type ConsultationHistoryItem = {
  id: string
  linkToken: string
  roomName: string
  doctorName: string
  patientIdentity?: string | null
  status: ConsultationStatus
  expiresAt?: string | null
  createdAt: string
  startedAt?: string | null
  endedAt?: string | null
  twilioCallSid?: string | null
  call?: {
    status: CallStatus
    recordingUrl?: string | null
  } | null
  note?: ConsultationNote | null
}

export const consultationHistoryData: ConsultationHistoryItem[] = [
  {
    id: "CONS-1001",
    linkToken: "LK-4H9Z",
    roomName: "room-eagle-21",
    doctorName: "Dr. Sara Safari",
    patientIdentity: "Daniel Smith",
    status: "DONE",
    createdAt: "2026-03-08T08:10:00Z",
    startedAt: "2026-03-08T08:18:00Z",
    endedAt: "2026-03-08T08:47:00Z",
    twilioCallSid: "CA8f9d3e1b7c2",
    call: {
      status: "COMPLETED",
      recordingUrl: "https://recordings.example.com/cons-1001",
    },
    note: {
      transcript: "Patient reports 2 days of sore throat and mild fever.",
      summary:
        "Symptoms are consistent with viral pharyngitis. Advised hydration, rest, and OTC analgesics. Provided warning signs for follow-up.",
      soapJson: {
        subjective: "Sore throat, mild fever, fatigue for 2 days.",
        objective: "No shortness of breath, stable vitals reported.",
        assessment: "Likely viral upper respiratory infection.",
        plan: "Hydration, paracetamol, reassess in 48 hours if worse.",
      },
      transcribedAt: "2026-03-08T09:00:00Z",
      summarizedAt: "2026-03-08T09:12:00Z",
      aiModel: "twilio-realtime + gemini",
    },
  },
  {
    id: "CONS-1002",
    linkToken: "LK-5G2M",
    roomName: "room-lotus-07",
    doctorName: "Dr. Michael Lee",
    patientIdentity: "Olivia Brown",
    status: "DONE",
    createdAt: "2026-03-07T09:05:00Z",
    startedAt: "2026-03-07T09:15:00Z",
    endedAt: "2026-03-07T09:42:00Z",
    twilioCallSid: "CA9a2c4d6f11",
    call: {
      status: "COMPLETED",
      recordingUrl: "https://recordings.example.com/cons-1002",
    },
    note: {
      transcript: "Patient with recurring migraine episodes, no red flags.",
      summary:
        "Discussed trigger tracking, hydration, and short course of NSAIDs. Recommended neurology referral if headaches increase in frequency.",
      soapJson: {
        subjective: "Recurring migraine, photophobia, nausea.",
        objective: "No neuro deficits reported.",
        assessment: "Migraine without aura.",
        plan: "NSAIDs PRN, lifestyle triggers, follow-up in 2 weeks.",
      },
      transcribedAt: "2026-03-07T10:05:00Z",
      summarizedAt: "2026-03-07T10:18:00Z",
      aiModel: "twilio-realtime + gemini",
    },
  },
  {
    id: "CONS-1003",
    linkToken: "LK-9F0Q",
    roomName: "room-cedar-14",
    doctorName: "Dr. Emily Carter",
    patientIdentity: "James Wilson",
    status: "PROCESSING",
    createdAt: "2026-03-06T13:20:00Z",
    startedAt: "2026-03-06T13:25:00Z",
    endedAt: "2026-03-06T13:58:00Z",
    twilioCallSid: "CA7b8c2a1d44",
    call: {
      status: "RECORDING_READY",
      recordingUrl: "https://recordings.example.com/cons-1003",
    },
    note: {
      transcript: "Follow-up on hypertension treatment adherence.",
      summary: null,
      soapJson: null,
      transcribedAt: "2026-03-06T14:20:00Z",
      summarizedAt: null,
      aiModel: "twilio-realtime + gemini",
    },
  },
  {
    id: "CONS-1004",
    linkToken: "LK-2R7T",
    roomName: "room-ember-03",
    doctorName: "Dr. Kevin Hart",
    patientIdentity: "Sophia Davis",
    status: "FAILED",
    createdAt: "2026-03-05T14:10:00Z",
    startedAt: "2026-03-05T14:12:00Z",
    endedAt: "2026-03-05T14:18:00Z",
    twilioCallSid: "CA5f7e0a9b12",
    call: {
      status: "FAILED",
      recordingUrl: null,
    },
    note: null,
  },
  {
    id: "CONS-1005",
    linkToken: "LK-1Z4V",
    roomName: "room-summit-09",
    doctorName: "Dr. Sara Safari",
    patientIdentity: "Michael Brown",
    status: "EXPIRED",
    createdAt: "2026-03-05T15:40:00Z",
    expiresAt: "2026-03-05T16:10:00Z",
    startedAt: null,
    endedAt: null,
    twilioCallSid: null,
    call: null,
    note: null,
  },
  {
    id: "CONS-1006",
    linkToken: "LK-6P3N",
    roomName: "room-aurora-19",
    doctorName: "Dr. Michael Lee",
    patientIdentity: "Emma Wilson",
    status: "IN_CALL",
    createdAt: "2026-03-10T04:50:00Z",
    startedAt: "2026-03-10T05:05:00Z",
    endedAt: null,
    twilioCallSid: "CA1a4b6c7d88",
    call: {
      status: "CONNECTED",
      recordingUrl: null,
    },
    note: null,
  },
  {
    id: "CONS-1007",
    linkToken: "LK-8D1X",
    roomName: "room-pine-22",
    doctorName: "Dr. Emily Carter",
    patientIdentity: "Ava Martinez",
    status: "WAITING",
    createdAt: "2026-03-10T02:25:00Z",
    expiresAt: "2026-03-10T03:25:00Z",
    startedAt: null,
    endedAt: null,
    twilioCallSid: null,
    call: null,
    note: null,
  },
]
