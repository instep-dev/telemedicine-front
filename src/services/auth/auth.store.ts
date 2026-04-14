import { create } from "zustand";
import type { UserDto } from "./auth.dto";

type AuthState = {
  accessToken: string | null;
  user: UserDto | null;
  bootstrapped: boolean;

  setAuth: (payload: { accessToken: string; user?: UserDto | null }) => void;
  clear: () => void;
  setBootstrapped: (v: boolean) => void;
};

export const authStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  bootstrapped: false,

  setAuth: ({ accessToken, user }) =>
    set((s) => ({
      accessToken,
      user: user ?? s.user,
    })),

  clear: () => set({ accessToken: null, user: null }),
  setBootstrapped: (v) => set({ bootstrapped: v }),
}));
