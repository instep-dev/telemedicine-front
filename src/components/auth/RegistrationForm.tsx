"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useRegisterMutation } from "@/services/auth/auth.queries";
import type { RegisterDto, UserRole } from "@/services/auth/auth.dto";
import Input from "@/components/dashboard/form/input/InputField";
import { Google } from "../reusable/Google";
import { Microsoft } from "../reusable/Microsoft";
import {  EyeIcon, EyeSlashIcon, LockIcon, UserIcon, PhoneIcon, IdentificationCardIcon, CalendarIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { CircleNotchIcon } from "@phosphor-icons/react";

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const apiBase = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_NEST_API || "";
    return base.endsWith("/") ? base.slice(0, -1) : base;
  }, []);

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
        <div className="w-full h-[1px] bg-accent/30" />
        <p className="text-[10px] text-accent">Or</p>
        <div className="w-full h-[1px] bg-accent/30" />
      </div>

      <div className="mt-6 flex items-center justify-between gap-x-3">
        <div>
          <label className="block text-xs text-accent mb-2">Full Name</label>
          <Input
            className="border w-full p-2 rounded-md"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            icon={UserIcon}
          />
        </div>
        <div>
          <label className="block text-xs text-accent mb-2">Email</label>
            <Input
              className="border w-full p-2 rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="email@domain.com"
              icon={EnvelopeSimpleIcon}
            />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-x-3">
        <div>
          <label className="block text-xs text-accent mb-2">Phone</label>
          <Input
            type="tel"
            inputMode="numeric"
            className="border w-full p-2 rounded-md"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08xxxxxxxxxx"
            icon={PhoneIcon}
          />
        </div>
        <div>
          {role === "DOCTOR" && (
            <div>
              <label className="block text-xs text-accent mb-2">License</label>
              <Input
                className="border w-full p-2 rounded-md"
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
                className="border w-full p-2 rounded-md"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="101-2024-001"
                icon={IdentificationCardIcon}
              />
            </div>
          )}

           {role === "PATIENT" && (
              <div>
                <label className="block text-xs text-accent mb-2">Born Date</label>
                <Input
                  type="date"
                  className="border w-full p-2 rounded-md"
                  value={bornDate}
                  onChange={(e) => setBornDate(e.target.value)}
                  icon={CalendarIcon}
                />
              </div>
            )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-x-3">
        <div className="relative w-full">
          <label className="block text-xs text-accent mb-2">Password</label>
          <Input
            className="border w-full p-2 rounded-md"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="*********"
            icon={LockIcon}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-accent hover:text-white"
          >
            {showPassword ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        </div>
        <div className="relative w-full">
          <label className="block text-xs text-accent mb-2">Confirm Password</label>
          <Input
            className="border w-full p-2 rounded-md"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="*********"
            icon={LockIcon}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-9 text-accent hover:text-white"
          >
            {showConfirmPassword ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        </div>
      </div>

      {errorMessage && <p className="text-red-600 text-sm mt-4">{errorMessage}</p>}

      <button
        className="border px-4 py-2 rounded-lg border border-cultured text-sm mt-6 w-full bg-gradient-primary mx-auto"
        disabled={register.isPending}
      >
        {register.isPending ? <CircleNotchIcon className="animate-spin text-primary" /> : "Create Account"}
      </button>
    </form>
  );
}
