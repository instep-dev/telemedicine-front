import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileApi, type ChangeEmailRequest, type ConfirmEmailChangeRequest, type SetNewPasswordRequest } from "./profile.api";
import { authStore } from "@/services/auth/auth.store";

type VerifyResetCodeRequest = { code: string };

// ============== DOCTOR ==============
export const useGetDoctorProfileQuery = () => {
  return useQuery({
    queryKey: ["doctor-profile"],
    queryFn: profileApi.getDoctorProfile,
  });
};

export const useUpdateDoctorProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.updateDoctorProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["doctor-profile"], data);
      if (data.fullName) {
        const current = authStore.getState().user;
        if (current) {
          authStore.getState().setAuth({
            accessToken: authStore.getState().accessToken!,
            user: { ...current, name: data.fullName },
          });
        }
      }
    },
  });
};

export const useRequestEmailChangeDoctorMutation = () => {
  return useMutation({
    mutationFn: (payload: ChangeEmailRequest) =>
      profileApi.requestEmailChange("doctor", payload),
  });
};

export const useConfirmEmailChangeDoctorMutation = () => {
  return useMutation({
    mutationFn: (payload: ConfirmEmailChangeRequest) =>
      profileApi.confirmEmailChange("doctor", payload),
  });
};

export const useVerifyResetCodeDoctorMutation = () => {
  return useMutation({
    mutationFn: (payload: VerifyResetCodeRequest) =>
      profileApi.verifyResetCode("doctor", payload),
  });
};

export const useRequestPasswordResetDoctorMutation = () => {
  return useMutation({
    mutationFn: () => profileApi.requestPasswordReset("doctor"),
  });
};

export const useSetNewPasswordDoctorMutation = () => {
  return useMutation({
    mutationFn: (payload: SetNewPasswordRequest) =>
      profileApi.setNewPassword("doctor", payload),
  });
};

export const useUploadProfilePictureDoctorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => profileApi.uploadProfilePicture("doctor", file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-picture", "DOCTOR"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-profile"] });
    },
  });
};

// ============== ADMIN ==============
export const useGetAdminProfileQuery = () => {
  return useQuery({
    queryKey: ["admin-profile"],
    queryFn: profileApi.getAdminProfile,
  });
};

export const useUpdateAdminProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.updateAdminProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["admin-profile"], data);
      if (data.fullName) {
        const current = authStore.getState().user;
        if (current) {
          authStore.getState().setAuth({
            accessToken: authStore.getState().accessToken!,
            user: { ...current, name: data.fullName },
          });
        }
      }
    },
  });
};

export const useRequestEmailChangeAdminMutation = () => {
  return useMutation({
    mutationFn: (payload: ChangeEmailRequest) =>
      profileApi.requestEmailChange("admin", payload),
  });
};

export const useConfirmEmailChangeAdminMutation = () => {
  return useMutation({
    mutationFn: (payload: ConfirmEmailChangeRequest) =>
      profileApi.confirmEmailChange("admin", payload),
  });
};

export const useVerifyResetCodeAdminMutation = () => {
  return useMutation({
    mutationFn: (payload: VerifyResetCodeRequest) =>
      profileApi.verifyResetCode("admin", payload),
  });
};

export const useRequestPasswordResetAdminMutation = () => {
  return useMutation({
    mutationFn: () => profileApi.requestPasswordReset("admin"),
  });
};

export const useSetNewPasswordAdminMutation = () => {
  return useMutation({
    mutationFn: (payload: SetNewPasswordRequest) =>
      profileApi.setNewPassword("admin", payload),
  });
};

export const useUploadProfilePictureAdminMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => profileApi.uploadProfilePicture("admin", file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-picture", "ADMIN"] });
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
    },
  });
};

// ============== PATIENT ==============
export const useGetPatientProfileQuery = () => {
  return useQuery({
    queryKey: ["patient-profile"],
    queryFn: profileApi.getPatientProfile,
  });
};

export const useUpdatePatientProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.updatePatientProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["patient-profile"], data);
      if (data.fullName) {
        const current = authStore.getState().user;
        if (current) {
          authStore.getState().setAuth({
            accessToken: authStore.getState().accessToken!,
            user: { ...current, name: data.fullName },
          });
        }
      }
    },
  });
};

export const useRequestEmailChangePatientMutation = () => {
  return useMutation({
    mutationFn: (payload: ChangeEmailRequest) =>
      profileApi.requestEmailChange("patient", payload),
  });
};

export const useConfirmEmailChangePatientMutation = () => {
  return useMutation({
    mutationFn: (payload: ConfirmEmailChangeRequest) =>
      profileApi.confirmEmailChange("patient", payload),
  });
};

export const useVerifyResetCodePatientMutation = () => {
  return useMutation({
    mutationFn: (payload: VerifyResetCodeRequest) =>
      profileApi.verifyResetCode("patient", payload),
  });
};

export const useRequestPasswordResetPatientMutation = () => {
  return useMutation({
    mutationFn: () => profileApi.requestPasswordReset("patient"),
  });
};

export const useSetNewPasswordPatientMutation = () => {
  return useMutation({
    mutationFn: (payload: SetNewPasswordRequest) =>
      profileApi.setNewPassword("patient", payload),
  });
};

export const useUploadProfilePicturePatientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => profileApi.uploadProfilePicture("patient", file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-picture", "PATIENT"] });
      queryClient.invalidateQueries({ queryKey: ["patient-profile"] });
    },
  });
};

// ============== NURSE ==============
export const useGetNurseProfileQuery = () => {
  return useQuery({
    queryKey: ["nurse-profile"],
    queryFn: profileApi.getNurseProfile,
  });
};

export const useUpdateNurseProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.updateNurseProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["nurse-profile"], data);
      if (data.fullName) {
        const current = authStore.getState().user;
        if (current) {
          authStore.getState().setAuth({
            accessToken: authStore.getState().accessToken!,
            user: { ...current, name: data.fullName },
          });
        }
      }
    },
  });
};

export const useRequestEmailChangeNurseMutation = () => {
  return useMutation({
    mutationFn: (payload: ChangeEmailRequest) =>
      profileApi.requestEmailChange("nurse", payload),
  });
};

export const useConfirmEmailChangeNurseMutation = () => {
  return useMutation({
    mutationFn: (payload: ConfirmEmailChangeRequest) =>
      profileApi.confirmEmailChange("nurse", payload),
  });
};

export const useVerifyResetCodeNurseMutation = () => {
  return useMutation({
    mutationFn: (payload: { code: string }) =>
      profileApi.verifyResetCode("nurse", payload),
  });
};

export const useRequestPasswordResetNurseMutation = () => {
  return useMutation({
    mutationFn: () => profileApi.requestPasswordReset("nurse"),
  });
};

export const useSetNewPasswordNurseMutation = () => {
  return useMutation({
    mutationFn: (payload: SetNewPasswordRequest) =>
      profileApi.setNewPassword("nurse", payload),
  });
};

export const useUploadProfilePictureNurseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => profileApi.uploadProfilePicture("nurse", file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-picture", "NURSE"] });
      queryClient.invalidateQueries({ queryKey: ["nurse-profile"] });
    },
  });
};
