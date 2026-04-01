"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useLogoutMutation } from "@/services/auth/auth.queries";
import { LoginRoutes } from "@/lib/route";
import { authStore } from "@/services/auth/auth.store";
import { getInitials } from "@/hooks/useInitials";
import { CaretDownIcon, EnvelopeIcon, PersonIcon, SignOutIcon, UserFocusIcon, UserIcon } from "@phosphor-icons/react";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const logout = useLogoutMutation();
  const doctor = authStore((s) => s.doctor);
  const doctorName = doctor?.name?.trim() || doctor?.email?.trim() || "Doctor";
  const doctorEmail = doctor?.email?.trim() || "-";

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
      // If token already expired, logout may return 401; we still redirect.
    } finally {
      router.replace(LoginRoutes.login);
    }
  }
  return (
    <div className="relative">
      <button
        onClick={toggleDropdown} 
        className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle"
      >
        <span className="mr-3 flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-sm font-semibold text-gray-700">
          {getInitials(doctorName)}
        </span>

        <span className="block mr-1 font-medium text-theme-sm">{doctorName}</span>

        <CaretDownIcon weight="bold"
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
       
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <div className="block font-medium text-black text-theme-sm dark:text-gray-400 flex items-center gap-x-1">
            <UserIcon weight="fill" className="text-gray-500"/>
            {doctorName}
          </div>
          <span className="mt-0.5 block flex items-center gap-1 text-theme-xs text-gray-500 dark:text-gray-400">
            <EnvelopeIcon weight="regular" className="text-gray-500"/>
            {doctorEmail}
          </span>
        </div>

        <div className="my-4 mb-3 w-full h-[0.5px] bg-gray-200"/>

        <DropdownItem
          onClick={handleLogout}
          variant={false}
          className={`border border-red-100 bg-red-50 text-red-600 flex items-center gap-3 px-3 py-2 mt-2 font-medium rounded-lg group text-theme-sm ${
            logout.isPending ? "pointer-events-none opacity-60" : ""
          }`}
        >
          <SignOutIcon/>
          Logout
        </DropdownItem>
      </Dropdown>
    </div>
  );
}
