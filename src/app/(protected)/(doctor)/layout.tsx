"use client"

import DashboardLayout from "@/layout/DashboardLayout";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import RoleGate from "@/components/auth/RoleGate";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {

  return (
    <ThemeProvider>
      {/* <div className="dashboard-theme dark" data-theme-mode="dark" data-theme-preset="default"> */}
        <RoleGate allowed={["DOCTOR"]}>
          <SidebarProvider>
            <DashboardLayout>{children}</DashboardLayout>
          </SidebarProvider>
        </RoleGate>
      {/* </div> */}
    </ThemeProvider>
  )
}
