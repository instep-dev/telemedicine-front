import { http } from "@/services/api/axios";
import type { SoapNoteDto, UpdateSoapNoteBody } from "./soap-notes.dto";

export const soapNotesApi = {
  async getNote(accessToken: string, sessionId: string): Promise<SoapNoteDto> {
    const res = await http.get<SoapNoteDto>(`/soap-notes/${sessionId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data;
  },

  async updateNote(
    accessToken: string,
    sessionId: string,
    body: UpdateSoapNoteBody,
  ): Promise<SoapNoteDto> {
    const res = await http.patch<SoapNoteDto>(`/soap-notes/${sessionId}`, body, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data;
  },

  async finalizeNote(accessToken: string, sessionId: string): Promise<SoapNoteDto> {
    const res = await http.post<SoapNoteDto>(`/soap-notes/${sessionId}/finalize`, {}, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data;
  },

  /**
   * Opens an SSE stream. Caller is responsible for closing the EventSource.
   * Returns the raw EventSource so the component can add listeners and close it.
   */
  openStream(accessToken: string, sessionId: string): EventSource {
    const baseUrl = process.env.NEXT_PUBLIC_NEST_API ?? "";
    const url = `${baseUrl}/soap-notes/${sessionId}/stream`;

    // EventSource does not support custom headers natively.
    // We pass the token as a query param; the backend must accept it.
    // Alternatively, use a cookie-based auth (already set via withCredentials).
    // Here we rely on the httpOnly cookie flow used by this project.
    return new EventSource(url, { withCredentials: true });
  },
};
