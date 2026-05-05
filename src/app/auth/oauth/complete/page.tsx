"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useOAuthCompleteMutation } from "@/services/auth/auth.queries";
import { authApi } from "@/services/auth/auth.api";
import { authStore } from "@/services/auth/auth.store";
import { getDashboardPath } from "@/lib/route";
import type { UserRole } from "@/services/auth/auth.dto";
import Input from "@/components/dashboard/form/input/InputField";
import {
  UserIcon,
  PhoneIcon,
  IdentificationCardIcon,
  CalendarIcon,
  CircleNotchIcon,
  HeartIcon,
  CaretLeftIcon,
} from "@phosphor-icons/react";

const roles: Record<UserRole, string> = {
  DOCTOR: "Doctor",
  ADMIN: "Admin",
  PATIENT: "Patient",
  NURSE: "Nurse",
};

function OAuthCompletePageContent() {
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
  const [nurseId, setNurseId] = useState("");
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
        nurseId: role === "NURSE" ? nurseId : undefined,
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
      <div className="py-6 px-4 sm:px-8 lg:px-12 flex items-center justify-center min-h-screen">
        <p className="text-sm text-red-600">Token OAuth tidak valid.</p>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-8 lg:px-12 flex flex-col justify-between min-h-screen">
      <div className="text-sm text-right text-accent flex items-center justify-between">
        <button onClick={()=> router.back()} className="flex items-center justify-center gap-1 px-3 text-white py-2 rounded-full bg-gradient-gray border border-cultured">
          <CaretLeftIcon weight="fill"/>
          Back
        </button>
        <p>Complete your <span className="text-white">{roles[role]}</span> profile</p>
      </div>

      <div>
        <div className="text-center mb-6">
          <h3 className="text-2xl sm:text-3xl mb-2">Complete Your Profile</h3>
          <p className="text-accent text-sm max-w-xs text-center mx-auto">
            Please fill in the remaining details to finish setting up your {roles[role]} account.
          </p>
        </div>

        <form onSubmit={onSubmit} className="max-w-sm mx-auto space-y-6">
          <div>
            <label className="block text-xs text-accent mb-2">
              Full Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              icon={UserIcon}
            />
          </div>

          <div>
            <label className="block text-xs text-accent mb-2">Phone</label>
            <Input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
              icon={PhoneIcon}
            />
          </div>

          {role === "DOCTOR" && (
            <div>
              <label className="block text-xs text-accent mb-2">License</label>
              <Input
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                placeholder="12345/SIP-1/2026"
                icon={IdentificationCardIcon}
              />
            </div>
          )}

          {role === "ADMIN" && (
            <div>
              <label className="block text-xs text-accent mb-2">Admin ID</label>
              <Input
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="101-2024-001"
                icon={IdentificationCardIcon}
              />
            </div>
          )}

          {role === "NURSE" && (
            <div>
              <label className="block text-xs text-accent mb-2">Nurse ID</label>
              <Input
                value={nurseId}
                onChange={(e) => setNurseId(e.target.value)}
                placeholder="NUR-ICU-005"
                icon={IdentificationCardIcon}
              />
            </div>
          )}

          {role === "PATIENT" && (
            <div>
              <label className="block text-xs text-accent mb-2">Born Date</label>
              <Input
                type="date"
                value={bornDate}
                onChange={(e) => setBornDate(e.target.value)}
                icon={CalendarIcon}
              />
            </div>
          )}

          {errorMessage && (
            <p className="text-red-600 text-sm">{errorMessage}</p>
          )}

          <button
            className="border px-4 py-2 rounded-lg border-cultured text-sm w-full bg-gradient-primary disabled:opacity-60"
            disabled={complete.isPending}
          >
            {complete.isPending ? (
              <CircleNotchIcon className="animate-spin text-primary mx-auto" />
            ) : (
              "Complete Registration"
            )}
          </button>
        </form>
      </div>

      <div className="flex items-center justify-between text-sm">
        <p>&copy; 2026, Telemedicine</p>
        <div className="flex gap-2 items-center">
          <p>Made with</p>
          <HeartIcon weight="fill" className="text-red-500" />
          <p className="text-accent">By Moefaris</p>
        </div>
      </div>
    </div>
  );
}

export default function OAuthCompletePage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <OAuthCompletePageContent />
    </Suspense>
  );
}
