import { http } from "@/services/api/axios";
import type {
  BasicOkResponse,
  LoginDto,
  LoginResponseDto,
  OAuthCompleteDto,
  RefreshResponseDto,
  RegisterDto,
  VerifyEmailDto,
  VerifyEmailResponseDto,
} from "./auth.dto";

export const authApi = {
  async login(payload: LoginDto): Promise<LoginResponseDto> {
    const res = await http.post<LoginResponseDto>("/auth/login", payload);
    return res.data;
  },

  async register(payload: RegisterDto): Promise<BasicOkResponse> {
    const res = await http.post<BasicOkResponse>("/auth/register", payload);
    return res.data;
  },

  async verifyEmail(payload: VerifyEmailDto): Promise<VerifyEmailResponseDto> {
    const res = await http.post<VerifyEmailResponseDto>("/auth/registration/verify-email", payload);
    return res.data;
  },

  async oauthComplete(payload: OAuthCompleteDto): Promise<LoginResponseDto> {
    const res = await http.post<LoginResponseDto>("/auth/oauth/complete", payload);
    return res.data;
  },

  async oauthSession(accessToken: string): Promise<LoginResponseDto> {
    const res = await http.post<LoginResponseDto>(
      "/auth/oauth/session",
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
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
