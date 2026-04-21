"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { authStore } from "@/services/auth/auth.store";
import { useLogoutMutation } from "@/services/auth/auth.queries";
import { useRouter } from "next/navigation";
import { LoginRoutes } from "@/lib/route";

const useAuthSnapshot = () =>
  useSyncExternalStore(
    authStore.subscribe,
    () => authStore.getState(),
    () => authStore.getState(),
  );

export default function PatientDashboardPage() {
  const { user } = useAuthSnapshot();
  const logout = useLogoutMutation()
  const router = useRouter()

  async function handleLogout() {
    if (logout.isPending) return;
    // closeDropdown();
    try {
      await logout.mutateAsync();
    } catch {
      // ignore
    } finally {
      router.replace(LoginRoutes.login);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-2">Patient Dashboard</h1>
      <p className="text-sm text-gray-600 mb-6">
        Halo, {user?.name ?? "Patient"}.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-md p-4">
          <p className="text-sm text-gray-500">Role</p>
          <p className="text-lg font-medium">{user?.role ?? "-"}</p>
        </div>
        <div className="border rounded-md p-4">
          <p className="text-sm text-gray-500">Phone</p>
          <p className="text-lg font-medium">{user?.phone ?? "-"}</p>
        </div>
      </div>

      <button onClick={handleLogout}
          className={`border border-cultured bg-red-400/10 text-red-600 flex items-center rounded-lg group text-xs p-6 mt-4 ${
            logout.isPending ? "pointer-events-none opacity-60" : ""
          }`}
        >
          Logout
      </button>

      <div className="mt-6">
        <Link
          href="/patient/schedule"
          className="inline-flex rounded-lg bg-gray-900 text-white px-4 py-2 text-sm font-medium"
        >
          Open My Schedule
        </Link>
      </div>
    </div>
  );
}
