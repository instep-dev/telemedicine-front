"use client";

import { authStore } from "@/services/auth/auth.store";
import { authApi } from "@/services/auth/auth.api";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore, useState } from "react";
import { LoginRoutes } from "@/lib/route";
import { Slab } from "react-loading-indicators";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AiSummaryStatusWatcher from "@/providers/AiSummaryStatusWatcher";

const useAuthSnapshot = () => {
  return useSyncExternalStore(
    authStore.subscribe,
    () => authStore.getState(),
    () => authStore.getState(),
  );
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

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { accessToken, bootstrapped } = useAuthSnapshot();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!bootstrapped) return;
    if (!accessToken) router.replace(`${LoginRoutes.login}`);
  }, [bootstrapped, accessToken, router, pathname]);

  useEffect(() => {
    if (!accessToken) return;
    const expMs = getJwtExpiryMs(accessToken);
    if (!expMs) return;

    const logoutGraceMs = 1000;
    const timeoutMs = expMs - Date.now() - logoutGraceMs;

    const triggerLogout = async () => {
      try {
        await authApi.logout(accessToken);
      } catch {
        // ignore errors; we still clear local session
      } finally {
        authStore.getState().clear();
        router.replace(`${LoginRoutes.login}`);
      }
    };

    if (timeoutMs <= 0) {
      void triggerLogout();
      return;
    }

    const timer = setTimeout(() => {
      void triggerLogout();
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [accessToken, router]);

  if (!mounted) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div>
          <Slab color={["#001edf", "#1333ff", "#465fff", "#798bff"]} />
          <p className="text-center text-primary font-medium">Loading</p>
        </div>
      </div>
    );
  }

  if (!bootstrapped) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div>
          <Slab color={["#001edf", "#1333ff", "#465fff", "#798bff"]} />
          <p className="text-center text-primary font-medium">Loading</p>
        </div>
      </div>
    );
  }

  if (!accessToken) return null;

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        style={{ zIndex: 100000, top: "5rem" }}
      />
      <AiSummaryStatusWatcher />
      {children}
    </>
  );
}
