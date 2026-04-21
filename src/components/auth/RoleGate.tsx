"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { authStore } from "@/services/auth/auth.store";
import type { UserRole } from "@/services/auth/auth.dto";
import { LoginRoutes, getDashboardPath } from "@/lib/route";

type RoleGateProps = {
  allowed: UserRole[];
  children: React.ReactNode;
};

const useAuthSnapshot = () =>
  useSyncExternalStore(
    authStore.subscribe,
    () => authStore.getState(),
    () => authStore.getState(),
  );

export default function RoleGate({ allowed, children }: RoleGateProps) {
  const router = useRouter();
  const { bootstrapped, accessToken, user } = useAuthSnapshot();

  useEffect(() => {
    if (!bootstrapped) return;
    if (!accessToken || !user) {
      router.replace(LoginRoutes.login);
      return;
    }
    if (!allowed.includes(user.role)) {
      router.replace(getDashboardPath(user.role));
    }
  }, [bootstrapped, accessToken, user, allowed, router]);

  if (!bootstrapped) return null;
  if (!accessToken || !user) return null;
  if (!allowed.includes(user.role)) return null;

  return <>{children}</>;
}
