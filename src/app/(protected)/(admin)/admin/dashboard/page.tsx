"use client";

import { useSyncExternalStore } from "react";
import { authStore } from "@/services/auth/auth.store";

const useAuthSnapshot = () =>
  useSyncExternalStore(
    authStore.subscribe,
    () => authStore.getState(),
    () => authStore.getState(),
  );

export default function AdminDashboardPage() {
  const { user } = useAuthSnapshot();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-2">Admin Dashboard</h1>
      <p className="text-sm text-gray-600 mb-6">
        Selamat datang, {user?.name ?? "Admin"}.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-md p-4">
          <p className="text-sm text-gray-500">Role</p>
          <p className="text-lg font-medium">{user?.role ?? "-"}</p>
        </div>
        <div className="border rounded-md p-4">
          <p className="text-sm text-gray-500">Email</p>
          <p className="text-lg font-medium">{user?.email ?? "-"}</p>
        </div>
      </div>
    </div>
  );
}
