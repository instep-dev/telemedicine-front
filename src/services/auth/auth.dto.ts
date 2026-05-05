export type UserRole = "DOCTOR" | "ADMIN" | "PATIENT" | "NURSE";

export type LoginDto = {
  identifier: string; // email atau phone
  password: string;
  rememberMe?: boolean;
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
  nurseId?: string;
  bornDate?: string;
};

export type VerifyEmailDto = {
  email: string;
  code: string;
};

export type VerifyEmailResponseDto = {
  ok?: boolean;
  accessToken?: string;
  user?: UserDto;
};

export type OAuthCompleteDto = {
  token: string;
  phone: string;
  name?: string;
  bornDate?: string;
  license?: string;
  adminId?: string;
  nurseId?: string;
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

export type DoctorProfileDto = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  license: string;
  profilePicture?: string | null;
};

export type AdminProfileDto = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  adminId: string;
  profilePicture?: string | null;
};

export type PatientProfileDto = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  bornDate: string;
  profilePicture?: string | null;
};

export type UpdateDoctorProfileDto = {
  fullName?: string;
  phone?: string;
  password?: string;
};

export type UpdateAdminProfileDto = {
  fullName?: string;
  phone?: string;
  password?: string;
};

export type UpdatePatientProfileDto = {
  fullName?: string;
  phone?: string;
  bornDate?: string;
  password?: string;
};

export type NurseProfileDto = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  nurseId: string;
  profilePicture?: string | null;
};

export type UpdateNurseProfileDto = {
  fullName?: string;
  phone?: string;
  password?: string;
};
