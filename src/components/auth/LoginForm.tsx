"use client";

import { useMemo, useState } from "react";
import { useLoginMutation } from "@/services/auth/auth.queries";
import { useRouter, useSearchParams } from "next/navigation";
import type { UserRole } from "@/services/auth/auth.dto";
import { getDashboardPath } from "@/lib/route";
import Input from "@/components/dashboard/form/input/InputField";
import { Google } from "../reusable/Google";
import { Microsoft } from "../reusable/Microsoft";
import { CircleNotchIcon, EnvelopeSimpleIcon, LockIcon, UserIcon } from "@phosphor-icons/react";
import Notify from "../reusable/Notify";

const roleLabels: Record<UserRole, string> = {
  DOCTOR: "Doctor",
  ADMIN: "Admin",
  PATIENT: "Patient",
  NURSE: "Nurse",
};

export default function LoginForm({ role }: { role: UserRole }) {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next");

  const login = useLoginMutation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const apiBase = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_NEST_API || "";
    return base.endsWith("/") ? base.slice(0, -1) : base;
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const result = await login.mutateAsync({ identifier, password, rememberMe });
      router.replace(next || getDashboardPath(result.user.role));
    } catch {
      // handled via state
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto">
      <div className="flex items-center gap-x-3 text-sm">
        <button
          type="button"
          className="w-full border border-cultured bg-gradient-gray rounded-md py-2 flex items-center gap-x-2 justify-center"
          onClick={() =>
            (window.location.href = `${apiBase}/auth/oauth/google/start?role=${role}`)
          }
        >
          <Google className="h-3 w-3 shrink-0" />
          Google
        </button>

        <button
          type="button"
          className="w-full border border-cultured bg-gradient-gray rounded-md py-2 flex items-center gap-x-2 justify-center"
          onClick={() =>
            (window.location.href = `${apiBase}/auth/oauth/microsoft/start?role=${role}`)
          }
        >
          <Microsoft className="h-3 w-3 shrink-0" />
          Microsoft
        </button>
      </div>
      <div className="flex items-center gap-x-2 justify-between">
        <div className="w-full h-[1px] bg-accent/30"/>
        <p className="text-[10px] text-accent">Or</p>
        <div className="w-full h-[1px] bg-accent/30"/>
      </div>
      <div className="mt-6">
        <label className="block text-xs text-accent mb-2">Username</label>
        <Input
          className="border w-full p-2 rounded-md"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          autoComplete="username"
          placeholder="Email or Phone"
          icon={identifier.includes('@') ? EnvelopeSimpleIcon : UserIcon}
        />
      </div>

      <div className="mt-6">
        <label className="block text-xs text-accent mb-2">Password</label>
        <Input
          className="border w-full p-2 rounded-md"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          placeholder="*********"
          icon={LockIcon}
        />
      </div>

      <div className="mt-4 flex items-center gap-x-2">
        <input
          type="checkbox"
          id="rememberMe"
          className="w-4 h-4 rounded border-cultured bg-card text-primary focus:ring-primary"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        <label htmlFor="rememberMe" className="text-xs text-accent cursor-pointer">
          Remember me for 10 days
        </label>
      </div>

      {login.isError && <Notify variant={false} error={'Login failed, check your credentials'}/>}

      <button className="border px-4 py-2 rounded-lg border border-cultured text-sm mt-6 w-full bg-gradient-primary mx-auto flex items-center justify-center" disabled={login.isPending}>
        {login.isPending ? <CircleNotchIcon className="animate-spin text-white"/> : "Login"}
      </button>
    </form>
  );
}
