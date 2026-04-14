"use client";

import RoleGate from "@/components/auth/RoleGate";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RoleGate allowed={["ADMIN"]}>{children}</RoleGate>;
}
