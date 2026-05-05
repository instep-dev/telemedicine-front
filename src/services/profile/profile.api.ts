import { http } from "@/services/api/axios";
import type {
  DoctorProfileDto,
  AdminProfileDto,
  PatientProfileDto,
  NurseProfileDto,
  UpdateDoctorProfileDto,
  UpdateAdminProfileDto,
  UpdatePatientProfileDto,
  UpdateNurseProfileDto,
} from "@/services/auth/auth.dto";

export interface ChangeEmailRequest {
  newEmail: string;
  password: string;
}

export interface ConfirmEmailChangeRequest {
  newEmail: string;
  code: string;
}

export interface SetNewPasswordRequest {
  code: string;
  newPassword: string;
}

export interface ProfileOperationResponse {
  ok: boolean;
  expiresInMinutes?: number;
  profilePicture?: string;
}

const roleEndpoints = {
  doctor: {
    get: "/profile/doctor",
    update: "/profile/doctor",
    changeEmail: "/profile/doctor/change-email",
    confirmEmail: "/profile/doctor/confirm-email-change",
    forgotPassword: "/profile/doctor/forgot-password",
    verifyResetCode: "/profile/doctor/verify-reset-code",
    setNewPassword: "/profile/doctor/set-new-password",
    uploadPicture: "/profile/doctor/upload-picture",
  },
  admin: {
    get: "/profile/admin",
    update: "/profile/admin",
    changeEmail: "/profile/admin/change-email",
    confirmEmail: "/profile/admin/confirm-email-change",
    forgotPassword: "/profile/admin/forgot-password",
    verifyResetCode: "/profile/admin/verify-reset-code",
    setNewPassword: "/profile/admin/set-new-password",
    uploadPicture: "/profile/admin/upload-picture",
  },
  patient: {
    get: "/profile/patient",
    update: "/profile/patient",
    changeEmail: "/profile/patient/change-email",
    confirmEmail: "/profile/patient/confirm-email-change",
    forgotPassword: "/profile/patient/forgot-password",
    verifyResetCode: "/profile/patient/verify-reset-code",
    setNewPassword: "/profile/patient/set-new-password",
    uploadPicture: "/profile/patient/upload-picture",
  },
  nurse: {
    get: "/profile/nurse",
    update: "/profile/nurse",
    changeEmail: "/profile/nurse/change-email",
    confirmEmail: "/profile/nurse/confirm-email-change",
    forgotPassword: "/profile/nurse/forgot-password",
    verifyResetCode: "/profile/nurse/verify-reset-code",
    setNewPassword: "/profile/nurse/set-new-password",
    uploadPicture: "/profile/nurse/upload-picture",
  },
};

export const profileApi = {
  // GET PROFILES
  async getDoctorProfile(): Promise<DoctorProfileDto> {
    const res = await http.get<DoctorProfileDto>(roleEndpoints.doctor.get);
    return res.data;
  },

  async getAdminProfile(): Promise<AdminProfileDto> {
    const res = await http.get<AdminProfileDto>(roleEndpoints.admin.get);
    return res.data;
  },

  async getPatientProfile(): Promise<PatientProfileDto> {
    const res = await http.get<PatientProfileDto>(roleEndpoints.patient.get);
    return res.data;
  },

  async getNurseProfile(): Promise<NurseProfileDto> {
    const res = await http.get<NurseProfileDto>(roleEndpoints.nurse.get);
    return res.data;
  },

  // UPDATE PROFILES
  async updateDoctorProfile(payload: UpdateDoctorProfileDto): Promise<DoctorProfileDto> {
    const res = await http.put<DoctorProfileDto>(roleEndpoints.doctor.update, payload);
    return res.data;
  },

  async updateAdminProfile(payload: UpdateAdminProfileDto): Promise<AdminProfileDto> {
    const res = await http.put<AdminProfileDto>(roleEndpoints.admin.update, payload);
    return res.data;
  },

  async updatePatientProfile(payload: UpdatePatientProfileDto): Promise<PatientProfileDto> {
    const res = await http.put<PatientProfileDto>(roleEndpoints.patient.update, payload);
    return res.data;
  },

  async updateNurseProfile(payload: UpdateNurseProfileDto): Promise<NurseProfileDto> {
    const res = await http.put<NurseProfileDto>(roleEndpoints.nurse.update, payload);
    return res.data;
  },

  // EMAIL CHANGE FLOW
  async requestEmailChange(role: "doctor" | "admin" | "patient" | "nurse", payload: ChangeEmailRequest): Promise<ProfileOperationResponse> {
    const res = await http.post<ProfileOperationResponse>(
      roleEndpoints[role].changeEmail,
      payload,
    );
    return res.data;
  },

  async confirmEmailChange(role: "doctor" | "admin" | "patient" | "nurse", payload: ConfirmEmailChangeRequest): Promise<ProfileOperationResponse> {
    const res = await http.post<ProfileOperationResponse>(
      roleEndpoints[role].confirmEmail,
      payload,
    );
    return res.data;
  },

  // PASSWORD RESET FLOW
  async verifyResetCode(role: "doctor" | "admin" | "patient" | "nurse", payload: { code: string }): Promise<ProfileOperationResponse> {
    const res = await http.post<ProfileOperationResponse>(
      roleEndpoints[role].verifyResetCode,
      payload,
    );
    return res.data;
  },

  async requestPasswordReset(role: "doctor" | "admin" | "patient" | "nurse"): Promise<ProfileOperationResponse> {
    const res = await http.post<ProfileOperationResponse>(
      roleEndpoints[role].forgotPassword,
    );
    return res.data;
  },

  async setNewPassword(role: "doctor" | "admin" | "patient" | "nurse", payload: SetNewPasswordRequest): Promise<ProfileOperationResponse> {
    const res = await http.post<ProfileOperationResponse>(
      roleEndpoints[role].setNewPassword,
      payload,
    );
    return res.data;
  },

  // PROFILE PICTURE UPLOAD
  async uploadProfilePicture(role: "doctor" | "admin" | "patient" | "nurse", file: File): Promise<ProfileOperationResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await http.post<ProfileOperationResponse>(
      roleEndpoints[role].uploadPicture,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return res.data;
  },
};

