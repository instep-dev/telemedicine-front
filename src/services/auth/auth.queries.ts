import { useMutation } from "@tanstack/react-query";
import { authApi } from "./auth.api";
import { authStore } from "./auth.store";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      authStore.getState().setAuth({
        accessToken: data.accessToken,
        doctor: data.doctor,
      });
    },
  });
}

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: () => authApi.logout(authStore.getState().accessToken),
    onSettled: () => {
      authStore.getState().clear();
    },
  });
}

/**
 * Jalan sekali saat app load.
 * - success: set accessToken
 * - 401: normal (belum login)
 */
export const bootstrapAuth = async () => {
  try {
    const { accessToken, doctor } = await authApi.refresh();
    authStore.getState().setAuth({ accessToken, doctor });
  } catch (err: any) {
    // 401 = belum login => normal, cukup clear
    authStore.getState().clear();
  } finally {
    authStore.getState().setBootstrapped(true);
  }
}
