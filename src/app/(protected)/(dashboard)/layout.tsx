"use client"

import AdminLayout from "@/layout/AdminLayout";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  return (
    <ThemeProvider>
      {/* <div className="dashboard-theme dark" data-theme-mode="dark" data-theme-preset="default"> */}
        <SidebarProvider>
          <AdminLayout>{children}</AdminLayout>
        </SidebarProvider>
      {/* </div> */}
    </ThemeProvider>
  )
}
