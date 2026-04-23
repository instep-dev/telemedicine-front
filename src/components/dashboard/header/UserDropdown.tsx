"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useLogoutMutation } from "@/services/auth/auth.queries";
import { getProfilePath, LoginRoutes } from "@/lib/route";
import { authStore } from "@/services/auth/auth.store";
import { getInitials } from "@/hooks/useInitials";
import { UserIcon } from "@phosphor-icons/react";
import { profileApi } from "@/services/profile/profile.api";
import Image from "next/image";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const logout = useLogoutMutation();
  const user = authStore((s) => s.user);
  const role = user?.role ?? null;
  const userName = user?.name?.trim() || user?.email?.trim() || "User";
  const profileLink = getProfilePath(role || "PATIENT");

  const { data: profilePicture } = useQuery<string | null>({
    queryKey: ["profile-picture", role],
    queryFn: async () => {
      if (role === "DOCTOR") {
        const d = await profileApi.getDoctorProfile();
        return d.profilePicture ?? null;
      }
      if (role === "ADMIN") {
        const d = await profileApi.getAdminProfile();
        return d.profilePicture ?? null;
      }
      const d = await profileApi.getPatientProfile();
      return d.profilePicture ?? null;
    },
    enabled: !!role,
    staleTime: 1000 * 60 * 5,
  });

  const apiBase = (process.env.NEXT_PUBLIC_NEST_API || "").replace(/\/$/, "");
  const pictureUrl = profilePicture
    ? profilePicture.startsWith("http")
      ? profilePicture
      : `${apiBase}/${profilePicture.replace(/^\//, "")}`
    : null;

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  async function handleLogout() {
    if (logout.isPending) return;
    closeDropdown();
    try {
      await logout.mutateAsync();
    } catch {
      // ignore
    } finally {
      router.replace(LoginRoutes.login);
    }
  }

  const handleProfile = () => {
    router.push(profileLink);
    closeDropdown();
  };

  return (
    <div className="relative">
      <button onClick={toggleDropdown} className="flex items-center text-white dropdown-toggle">
        <span className="mr-3 flex h-11 w-11 items-center justify-center rounded-full border border-cultured bg-gradient-gray text-sm font-semibold text-white overflow-hidden">
          {pictureUrl ? (
            <Image
              src={pictureUrl}
              alt={userName}
              className="h-full w-full object-cover rounded-full"
              width={100}
              height={100}
            />
          ) : (
            getInitials(userName)
          )}
        </span>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-1 mt-[17px] w-[150px] space-y-3 rounded-lg border border-cultured bg-card shadow-xl p-3"
      >
        <DropdownItem
          onClick={handleProfile}
          variant={true}
          className={`border border-cultured bg-gradient-gray gap-x-1 font-semibold text-white flex items-center justify-center rounded-lg group text-xs ${
            logout.isPending ? "pointer-events-none opacity-60" : ""
          }`}
        >
          <UserIcon weight="bold"/>
          Edit Profile
        </DropdownItem>
        <div className="w-full h-[1px] bg-accent/10" />
        <DropdownItem
          onClick={handleLogout}
          variant={false}
          className={`border border-red-900 font-semibold flex items-center justify-center bg-red-500/10 text-red-600 rounded-lg group text-xs ${
            logout.isPending ? "pointer-events-none opacity-60" : ""
          }`}
        >
          Logout
        </DropdownItem>
      </Dropdown>
    </div>
  );
}
