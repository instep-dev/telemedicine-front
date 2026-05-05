import type { UserRole } from "@/services/auth/auth.dto";

export const LoginRoutes = {
  login: "/auth/login",
  dashboard: "/dashboard",
};

export const getDashboardPath = (role: UserRole) => {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "PATIENT") return "/patient/dashboard";
  if (role === "NURSE") return "/nurse/dashboard";
  return "/doctor/dashboard";
};

export const getProfilePath = (role: UserRole) => {
  if (role === "ADMIN") return "/admin/profile";
  if (role === "PATIENT") return "/patient/profile";
  if (role === "NURSE") return "/nurse/profile";
  return "/doctor/profile";
}

export const gethistoryPath = (role: UserRole) => {
  if (role === "ADMIN") return "/admin/history";
  if (role === "PATIENT") return "/patient/history";
  if (role === "NURSE") return "/nurse/history";
  return "/doctor/history";
}
