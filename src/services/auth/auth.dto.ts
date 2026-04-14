export type UserRole = "DOCTOR" | "ADMIN" | "PATIENT";

export type LoginDto = {
  identifier: string; // email atau phone
  password: string;
};

export type RegisterDto = {
  role: UserRole;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  license?: string;
  adminId?: string;
  bornDate?: string;
};

export type VerifyEmailDto = {
  token: string;
};

export type OAuthCompleteDto = {
  token: string;
  phone: string;
  name?: string;
  bornDate?: string;
  license?: string;
  adminId?: string;
};

export type UserDto = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string;
  twilioIdentity?: string | null;
};

export type LoginResponseDto = {
  accessToken: string;
  user: UserDto;
};

export type RefreshResponseDto = {
  accessToken: string;
  user?: UserDto;
};

export type BasicOkResponse = {
  ok: boolean;
};
