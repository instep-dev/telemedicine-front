import type { UserRole } from "@/services/auth/auth.dto";

export const LoginRoutes = {
  login: "/auth/login",
  dashboard: "/dashboard",
};

export const getDashboardPath = (role: UserRole) => {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "PATIENT") return "/patient/dashboard";
  return "/doctor/dashboard"; 
};
