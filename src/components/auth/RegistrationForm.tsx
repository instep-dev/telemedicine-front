"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useRegisterMutation } from "@/services/auth/auth.queries";
import type { RegisterDto, UserRole } from "@/services/auth/auth.dto";

const roleLabels: Record<UserRole, string> = {
  DOCTOR: "Dokter",
  ADMIN: "Admin",
  PATIENT: "Patient",
};

export default function RegistrationForm({ role }: { role: UserRole }) {
  const router = useRouter();
  const register = useRegisterMutation();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [license, setLicense] = useState("");
  const [adminId, setAdminId] = useState("");
  const [bornDate, setBornDate] = useState("");

  const roleLabel = useMemo(() => roleLabels[role], [role]);

  const errorMessage = useMemo(() => {
    const err: any = register.error;
    const msg = err?.response?.data?.message;
    if (!msg) return null;
    return Array.isArray(msg) ? msg.join(", ") : String(msg);
  }, [register.error]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload: RegisterDto = {
      role,
      fullName,
      email,
      phone,
      password,
      confirmPassword,
      license: role === "DOCTOR" ? license : undefined,
      adminId: role === "ADMIN" ? adminId : undefined,
      bornDate: role === "PATIENT" ? bornDate : undefined,
    };

    try {
      await register.mutateAsync(payload);
      router.replace(`/auth/registration/verify-email?email=${encodeURIComponent(email)}`);
    } catch {
      // error handled by mutation state
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4">
      <p className="text-sm text-gray-500">Registrasi sebagai {roleLabel}</p>

      <div>
        <label className="block text-sm mb-1">Full Name</label>
        <input
          className="border w-full p-2 rounded-md"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder={`Nama lengkap ${roleLabel?.toLowerCase()}`}
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Email</label>
        <input
          className="border w-full p-2 rounded-md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
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
          placeholder="08xxxxxxxxxx"
        />
      </div>

      {role === "DOCTOR" && (
        <div>
          <label className="block text-sm mb-1">License</label>
          <input
            className="border w-full p-2 rounded-md"
            value={license}
            onChange={(e) => setLicense(e.target.value)}
            placeholder="12345/SIP-1/2026"
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
            placeholder="101-2024-001"
          />
        </div>
      )}

      <div>
        <label className="block text-sm mb-1">Password</label>
        <input
          className="border w-full p-2 rounded-md"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">
          Minimal 8 karakter, 1 lowercase, 1 uppercase, 1 number.
        </p>
      </div>

      <div>
        <label className="block text-sm mb-1">Confirm Password</label>
        <input
          className="border w-full p-2 rounded-md"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

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

      {errorMessage && <p className="text-red-600 text-sm">{errorMessage}</p>}

      <button className="border px-4 py-2 rounded-md" disabled={register.isPending}>
        {register.isPending ? "Loading..." : "Create Account"}
      </button>
    </form>
  );
}
