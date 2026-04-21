import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { UserDto } from "./auth.dto";

type AuthState = {
  accessToken: string | null;
  user: UserDto | null;
  bootstrapped: boolean;

  setAuth: (payload: { accessToken: string; user?: UserDto | null }) => void;
  clear: () => void;
  setBootstrapped: (v: boolean) => void;
};

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: "telemedicine-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
    },
  ),
);
