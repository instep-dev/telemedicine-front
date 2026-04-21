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

export const getProfilePath = (role: UserRole) => {
  if (role === "ADMIN") return "/admin/profile";
  if (role === "PATIENT") return "/patient/profile";
  return "/doctor/profile"; 
}
