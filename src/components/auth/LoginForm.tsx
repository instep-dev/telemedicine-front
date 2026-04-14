"use client";

import { useMemo, useState } from "react";
import { useLoginMutation } from "@/services/auth/auth.queries";
import { useRouter, useSearchParams } from "next/navigation";
import type { UserRole } from "@/services/auth/auth.dto";
import { getDashboardPath } from "@/lib/route";

const roleLabels: Record<UserRole, string> = {
  DOCTOR: "Dokter",
  ADMIN: "Admin",
  PATIENT: "Patient",
};

export default function LoginForm({ role }: { role: UserRole }) {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next");

  const login = useLoginMutation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const apiBase = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_NEST_API || "";
    return base.endsWith("/") ? base.slice(0, -1) : base;
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const result = await login.mutateAsync({ identifier, password });
      router.replace(next || getDashboardPath(result.user.role));
    } catch {
      // handled via state
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm space-y-4">
      <p className="text-sm text-gray-500">Login sebagai {roleLabels[role]}</p>
      <div>
        <label className="block text-sm mb-1">Email atau Nomor Telepon</label>
        <input
          className="border w-full p-2 rounded-md"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          autoComplete="username"
          placeholder="email@domain.com / 0812xxxx"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Password</label>
        <input
          className="border w-full p-2 rounded-md"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>

      {login.isError && (
        <p className="text-red-600 text-sm">Login gagal. Cek kredensial.</p>
      )}

      <button className="border px-4 py-2 rounded-md" disabled={login.isPending}>
        {login.isPending ? "Loading..." : "Login"}
      </button>

      <div className="pt-2 space-y-2">
        <button
          type="button"
          className="w-full border px-4 py-2 rounded-md"
          onClick={() =>
            (window.location.href = `${apiBase}/auth/oauth/google/start?role=${role}`)
          }
        >
          Login dengan Google
        </button>
        <button
          type="button"
          className="w-full border px-4 py-2 rounded-md"
          onClick={() =>
            (window.location.href = `${apiBase}/auth/oauth/microsoft/start?role=${role}`)
          }
        >
          Login dengan Microsoft
        </button>
      </div>

      <div className="text-sm">
        Belum punya akun?{" "}
        <a className="underline" href={`/auth/registration?role=${role}`}>
          Registrasi
        </a>
      </div>
    </form>
  );
}
