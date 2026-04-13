"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useLogoutMutation } from "@/services/auth/auth.queries";
import { LoginRoutes } from "@/lib/route";
import { authStore } from "@/services/auth/auth.store";
import { getInitials } from "@/hooks/useInitials";
import { StairsIcon } from "@phosphor-icons/react";

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
      
    } finally {
      router.replace(LoginRoutes.login);
    }
  }
  return (
    <div className="relative">
      <button
        onClick={toggleDropdown} 
        className="flex items-center text-white dropdown-toggle"
      >
        <span className="mr-3 flex h-11 w-11 items-center justify-center rounded-full border border-cultured bg-gradient-gray text-sm font-semibold text-white">
          {getInitials(doctorName)}
        </span>

        {/* <span className="block mr-1 font-medium text-theme-sm">{doctorName}</span> */}

        {/* <CaretDownIcon weight="bold"
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        /> */}
       
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[100px] flex-col rounded-lg border border-cultured bg-card p-3"
      >
        {/* <div>
          <div className="block font-semibold text-white text-sm flex items-center gap-x-1">
            <UserIcon weight="fill" className="text-gray-500"/>
            {doctorName}
          </div>
          <span className="mt-0.5 block flex items-center gap-1 text-xs text-accent ">
            <EnvelopeIcon weight="regular" className="text-gray-500"/>
            {doctorEmail}
          </span>
        </div> */}

        {/* <div className="my-4 mb-3 w-full h-[0.5px] bg-gray-200"/> */}

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
