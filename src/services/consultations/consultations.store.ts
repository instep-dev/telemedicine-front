import { create } from "zustand";
import type { ConsultationSessionDto } from "./consultations.dto";

type ConsultationState = {
  activeConsultation: ConsultationSessionDto | null;
  setActiveConsultation: (c: ConsultationSessionDto | null) => void;
};

export const useConsultationStore = create<ConsultationState>((set) => ({
  activeConsultation: null,
  setActiveConsultation: (c) => set({ activeConsultation: c }),
}));
