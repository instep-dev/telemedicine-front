"use client";

import UserDropdown from "@/components/dashboard/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { MagnifyingGlassIcon, CaretDoubleLeftIcon } from "@phosphor-icons/react";


const AppHeader: React.FC = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 flex w-full bg-card text-white border-b border-cultured z-99999 ">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3  sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <button
            className="flex items-center justify-center w-10 h-10 text-white border-cultured rounded-lg bg-gradient-gray z-99999 lg:flex lg:h-11 lg:w-11 lg:border"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            <CaretDoubleLeftIcon size={16}/>
          </button>

          <Link href="/dashboard" className="lg:hidden">
            {/* <Image
              width={154}
              height={32}
              className="dark:hidden"
              src="/images/logo/logo.svg"
              alt="Logo"
            />
            <Image
              width={154}
              height={32}
              className="hidden dark:block"
              src="/images/logo/logo-dark.svg"
              alt="Logo"
            /> */}
          </Link>

          <div className="lg:hidden">
            <UserDropdown />
          </div>

          <div className="hidden lg:block">
            <form>
              <div className="relative">
                <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none text-accent">
                  <MagnifyingGlassIcon size={16} />
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search"
                  className="h-11 w-full rounded-lg border border-cultured bg-card py-2.5 pl-12 pr-14 text-sm text-white shadow-theme-xs placeholder:text-white/30  focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 xl:w-[430px]"
                />

                <button className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-md border border-cultured bg-gradient-gray px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-white">
                  <span> ⌘ </span>
                  <span> K </span>
                </button>
              </div>
            </form>
          </div>
        </div>
        <div
          className="hidden lg:flex items-center justify-between w-full gap-4 px-5 py-4 shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none"
        >
          <div className="flex items-center gap-2 2xsm:gap-3">
            {/* <CreateRoomButton /> */}
            {/* <!-- Dark Mode Toggler --> */}
            {/* <ThemeToggleButton /> */}
            {/* <!-- Dark Mode Toggler --> */}      
            {/* <NotificationsButton/>    */}
          </div>
          {/* <!-- User Area --> */}
          <UserDropdown /> 
          
        </div>
      </div>
    </header>
  );
};

export default AppHeader;

