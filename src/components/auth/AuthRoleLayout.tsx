"use client";

import { CircleNotchIcon, HeartIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { UserRole } from "@/services/auth/auth.dto";

type AuthRoleLayoutProps = {
  title: string;
  subtitle: string;
  promptText: string;
  promptHrefBase: string;
  promptLinkLabel: string;
  renderForm: (role: UserRole) => React.ReactNode;
};

const roles: { label: string; value: UserRole }[] = [
  { label: "Doctor", value: "DOCTOR" },
  { label: "Admin", value: "ADMIN" },
  { label: "Patient", value: "PATIENT" },
  { label: "Nurse", value: "NURSE" },
];

export default function AuthRoleLayout({
  title,
  subtitle,
  promptText,
  promptHrefBase,
  promptLinkLabel,
  renderForm,
}: AuthRoleLayoutProps) {
  const params = useSearchParams();
  const initialRole = useMemo(() => {
    const roleParam = (params.get("role") || "").toUpperCase();
    return roles.find((r) => r.value === roleParam)?.value ?? "DOCTOR";
  }, [params]);

  const [role, setRole] = useState<UserRole>("DOCTOR");
  const activeRoleIndex = useMemo(() => {
    const index = roles.findIndex((item) => item.value === role);
    return index >= 0 ? index : 0;
  }, [role]);

  useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  return (
    <div className="py-6 px-4 sm:px-8 lg:px-12 flex flex-col justify-between gap-y-6 sm:gap-y-12 min-h-screen">
      <div className="text-sm text-accent flex items-center gap-x-1 justify-center sm:justify-end">
        {promptText}{" "}
        <div className="relative group">
          <Link className="text-white" href={`${promptHrefBase}?role=${role}`}>
            {promptLinkLabel}
            <div className="w-[1%] transition-all opacity-0 duration-400 h-[1px] group-hover:opacity-100 group-hover:w-full bg-white absolute bottom-0"/>
          </Link>
        </div>
      </div>
      <div>
        <div className="text-center">
          <h3 className="text-2xl sm:text-3xl mb-2">{title}</h3>
          <p className="text-accent text-sm">{subtitle}</p>
        </div>
        <div className="flex max-w-xs border mx-auto bg-card rounded-lg p-1 border-cultured my-6 relative">
          <div
            className="absolute top-1 bottom-1 left-1 w-[calc((100%-0.5rem)/4)] rounded-md bg-gradient-primary transition-transform duration-300 ease-out will-change-transform"
            style={{ transform: `translateX(${activeRoleIndex * 100}%)` }}
          />
          {roles.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setRole(item.value)}
              className={`relative z-10 py-2 w-full rounded-md text-xs ${
                role === item.value ? "text-white" : "text-accent/50 border-card"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <Suspense fallback={<CircleNotchIcon className="animate-spin text-3xl text-primary mx-auto" />}>
          {renderForm(role)}
        </Suspense>
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
