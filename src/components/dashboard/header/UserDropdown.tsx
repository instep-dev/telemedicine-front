"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useLogoutMutation } from "@/services/auth/auth.queries";
import { LoginRoutes } from "@/lib/route";
import { authStore } from "@/services/auth/auth.store";
import { getInitials } from "@/hooks/useInitials";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const logout = useLogoutMutation();
  const user = authStore((s) => s.user);
  const userName = user?.name?.trim() || user?.email?.trim() || "User";

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
  return (
    <div className="relative">
      <button onClick={toggleDropdown} className="flex items-center text-white dropdown-toggle">
        <span className="mr-3 flex h-11 w-11 items-center justify-center rounded-full border border-cultured bg-gradient-gray text-sm font-semibold text-white">
          {getInitials(userName)}
        </span>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[100px] flex-col rounded-lg border border-cultured bg-card p-3"
      >
        <DropdownItem
          onClick={handleLogout}
          variant={false}
          className={`border border-cultured bg-red-400/10 text-red-600 flex items-center rounded-lg group text-xs ${
            logout.isPending ? "pointer-events-none opacity-60" : ""
          }`}
        >
          Logout
        </DropdownItem>
      </Dropdown>
    </div>
  );
}
