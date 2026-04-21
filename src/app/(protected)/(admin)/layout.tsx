"use client";

import RoleGate from "@/components/auth/RoleGate";
import { ThemeProvider } from "@/context/ThemeContext";
import { SidebarProvider } from "@/context/SidebarContext";
import DashboardLayout from "@/layout/DashboardLayout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {/* <div className="dashboard-theme dark" data-theme-mode="dark" data-theme-preset="default"> */}
        <RoleGate allowed={["ADMIN"]}>
          <SidebarProvider>
            <DashboardLayout>{children}</DashboardLayout>
          </SidebarProvider>
        </RoleGate>
      {/* </div> */}
    </ThemeProvider>
  );
}
