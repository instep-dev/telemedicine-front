"use client";

import { authStore } from "@/services/auth/auth.store";
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
      />
      <AiSummaryStatusWatcher />
      {children}
    </>
  );
}