"use client";

import RoleGate from "@/components/auth/RoleGate";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return <RoleGate allowed={["PATIENT"]}>{children}</RoleGate>;
}
