"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useOAuthCompleteMutation } from "@/services/auth/auth.queries";
import { authApi } from "@/services/auth/auth.api";
import { authStore } from "@/services/auth/auth.store";
import { getDashboardPath } from "@/lib/route";
import type { UserRole } from "@/services/auth/auth.dto";

const roles: Record<UserRole, string> = {
  DOCTOR: "Dokter",
  ADMIN: "Admin",
  PATIENT: "Patient",
};

export default function OAuthCompletePage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const roleParam = (params.get("role") || "") as UserRole;
  const role = roles[roleParam] ? roleParam : "PATIENT";

  const complete = useOAuthCompleteMutation();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [license, setLicense] = useState("");
  const [adminId, setAdminId] = useState("");
  const [bornDate, setBornDate] = useState("");

  const errorMessage = useMemo(() => {
    const err: any = complete.error;
    const msg = err?.response?.data?.message;
    if (!msg) return null;
    return Array.isArray(msg) ? msg.join(", ") : String(msg);
  }, [complete.error]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      const data = await complete.mutateAsync({
        token,
        name: name || undefined,
        phone,
        license: role === "DOCTOR" ? license : undefined,
        adminId: role === "ADMIN" ? adminId : undefined,
        bornDate: role === "PATIENT" ? bornDate : undefined,
      });
      const session = await authApi.oauthSession(data.accessToken);
      authStore.getState().setAuth({ accessToken: session.accessToken, user: session.user });
      router.replace(getDashboardPath(session.user.role));
    } catch {
      // error handled by mutation state
    }
  }

  if (!token) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">Token OAuth tidak valid.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl mb-4">Lengkapi Data {roles[role]}</h1>
      <form onSubmit={onSubmit} className="max-w-lg space-y-4">
        <div>
          <label className="block text-sm mb-1">Full Name (wajib jika belum ada)</label>
          <input
            className="border w-full p-2 rounded-md"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Phone</label>
          <input
            type="tel"
            inputMode="numeric"
            className="border w-full p-2 rounded-md"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {role === "DOCTOR" && (
          <div>
            <label className="block text-sm mb-1">License</label>
            <input
              className="border w-full p-2 rounded-md"
              value={license}
              onChange={(e) => setLicense(e.target.value)}
            />
          </div>
        )}

        {role === "ADMIN" && (
          <div>
            <label className="block text-sm mb-1">Admin ID</label>
            <input
              className="border w-full p-2 rounded-md"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
            />
          </div>
        )}

        {errorMessage && <p className="text-red-600 text-sm">{errorMessage}</p>}

        {role === "PATIENT" && (
          <div>
            <label className="block text-sm mb-1">Born Date</label>
            <input
              type="date"
              className="border w-full p-2 rounded-md"
              value={bornDate}
              onChange={(e) => setBornDate(e.target.value)}
            />
          </div>
        )}

        <button className="border px-4 py-2 rounded-md" disabled={complete.isPending}>
          {complete.isPending ? "Loading..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
