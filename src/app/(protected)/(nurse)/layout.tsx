"use client"

import DashboardLayout from "@/layout/DashboardLayout";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import RoleGate from "@/components/auth/RoleGate";

export default function NurseLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <RoleGate allowed={["NURSE"]}>
        <SidebarProvider>
          <DashboardLayout>{children}</DashboardLayout>
        </SidebarProvider>
      </RoleGate>
    </ThemeProvider>
  )
}
