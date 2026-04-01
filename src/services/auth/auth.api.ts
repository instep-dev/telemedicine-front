import { http } from "@/services/api/axios";
import type { LoginDto, LoginResponseDto, RefreshResponseDto } from "./auth.dto";

export const authApi = {
  async login(payload: LoginDto): Promise<LoginResponseDto> {
    const res = await http.post<LoginResponseDto>("/auth/login", payload);
    return res.data;
  },

  async refresh(): Promise<RefreshResponseDto> {
    const res = await http.post<RefreshResponseDto>("/auth/refresh");
    return res.data;
  },

  async logout(accessToken?: string | null): Promise<void> {
    await http.post(
      "/auth/logout",
      {},
      accessToken
        ? {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        : undefined,
    );
  },
};
