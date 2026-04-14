"use client";

import RegistrationForm from "@/components/auth/RegistrationForm";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { UserRole } from "@/services/auth/auth.dto";

const roles: { label: string; value: UserRole }[] = [
  { label: "Dokter", value: "DOCTOR" },
  { label: "Admin", value: "ADMIN" },
  { label: "Patient", value: "PATIENT" },
];

export default function RegistrationPage() {
  const params = useSearchParams();
  const initialRole = useMemo(() => {
    const roleParam = (params.get("role") || "").toUpperCase();
    return roles.find((r) => r.value === roleParam)?.value ?? "DOCTOR";
  }, [params]);

  const [role, setRole] = useState<UserRole>(initialRole);

  return (
    <div className="p-6">
      <h1 className="text-xl mb-4">Registrasi</h1>
      <div className="flex gap-2 mb-4">
        {roles.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => setRole(r.value)}
            className={`border px-3 py-1.5 rounded-md text-sm ${
              role === r.value ? "bg-gray-900 text-white" : "bg-white"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      <RegistrationForm role={role} />
    </div>
  );
}
