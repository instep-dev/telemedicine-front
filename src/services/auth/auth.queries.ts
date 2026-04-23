import { useMutation } from "@tanstack/react-query";
import { authApi } from "./auth.api";
import { authStore } from "./auth.store";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      authStore.getState().setAuth({
        accessToken: data.accessToken,
        user: data.user,
      });
    },
  });
};

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: () => authApi.logout(authStore.getState().accessToken),
    onSettled: () => {
      authStore.getState().clear();
    },
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: authApi.register,
  });
};

export const useVerifyEmailMutation = () => {
  return useMutation({
    mutationFn: authApi.verifyEmail,
  });
};

export const useOAuthCompleteMutation = () => {
  return useMutation({
    mutationFn: authApi.oauthComplete,
    onSuccess: (data) => {
      authStore.getState().setAuth({
        accessToken: data.accessToken,
        user: data.user,
      });
    },
  });
};

const getJwtExpiryMs = (token: string): number | null => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    let base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad) {
      base64 += "=".repeat(4 - pad);
    }
    const json = atob(base64);
    const data = JSON.parse(json) as { exp?: number };
    if (!data.exp) return null;
    return data.exp * 1000;
  } catch {
    return null;
  }
};

const isTokenStillValid = (token: string) => {
  const expMs = getJwtExpiryMs(token);
  if (!expMs) return false;
  return expMs - Date.now() > 1_000;
};

/**
 * Jalan sekali saat app load.
 * - success: set accessToken
 * - 401: normal (belum login)
 */
export const bootstrapAuth = async () => {
  const current = authStore.getState();
  const fallbackToken = current.accessToken;
  const fallbackUser = current.user;
  try {
    const { accessToken, user } = await authApi.refresh();
    authStore.getState().setAuth({ accessToken, user });
  } catch {
    if (fallbackToken && fallbackUser && isTokenStillValid(fallbackToken)) {
      authStore.getState().setAuth({ accessToken: fallbackToken, user: fallbackUser });
    } else {
      authStore.getState().clear();
    }
  } finally {
    authStore.getState().setBootstrapped(true);
  }
};
