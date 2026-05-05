"use client";
import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CaretDownIcon,
  GridFourIcon,
  FirstAidIcon,
  TableIcon,
  DotsNineIcon,
  RobotIcon,
  CalendarBlankIcon,
} from "@phosphor-icons/react";
import { useSidebar } from "../../../context/SidebarContext";
import { authStore } from "@/services/auth/auth.store";
import type { UserRole } from "@/services/auth/auth.dto";
import { getDashboardPath } from "@/lib/route";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const NAV_ITEMS_BY_ROLE: Record<UserRole, NavItem[]> = {
  DOCTOR: [
    {
      icon: <GridFourIcon size={22} />,
      name: "Dashboard",
      path: "/doctor/dashboard",
    },
    {
      name: "Schedule",
      icon: <CalendarBlankIcon size={22} />,
      path: "/doctor/schedule",
    },
    {
      name: "Consultations History",
      icon: <TableIcon size={22} />,
      path: "/doctor/history",
    },
    {
      name: "AI Summary",
      icon: <RobotIcon size={22} />,
      path: "/doctor/ai-summary",
    },
  ],
  ADMIN: [
    {
      icon: <GridFourIcon size={22} />,
      name: "Dashboard",
      path: "/admin/dashboard",
    },
    {
      name: "Schedule",
      icon: <CalendarBlankIcon size={22} />,
      path: "/admin/schedule",
    },
  ],
  PATIENT: [
    {
      icon: <GridFourIcon size={22} />,
      name: "Dashboard",
      path: "/patient/dashboard",
    },
    {
      name: "Schedule",
      icon: <CalendarBlankIcon size={22} />,
      path: "/patient/schedule",
    },
    {
      name: "Consultations History",
      icon: <TableIcon size={22} />,
      path: "/patient/history",
    },
  ],
  NURSE: [
    {
      icon: <GridFourIcon size={22} />,
      name: "Dashboard",
      path: "/nurse/dashboard",
    },
    {
      name: "Schedule",
      icon: <CalendarBlankIcon size={22} />,
      path: "/nurse/schedule",
    },
    {
      name: "AI Summary",
      icon: <RobotIcon size={22} />,
      path: "/nurse/ai-summary",
    },
  ],
};

const OTHERS_ITEMS_BY_ROLE: Record<UserRole, NavItem[]> = {
  DOCTOR: [],
  ADMIN: [],
  PATIENT: [],
  NURSE: [],
};

const APP_TITLE_BY_ROLE: Record<UserRole, string> = {
  DOCTOR: "Teledoctor",
  ADMIN: "Teleadmin",
  PATIENT: "Telepatient",
  NURSE: "Telenurse",
};

const useAuthSnapshot = () =>
  useSyncExternalStore(
    authStore.subscribe,
    () => authStore.getState(),
    () => authStore.getState(),
  );

const inferRoleFromPathname = (pathname: string): UserRole => {
  if (pathname.startsWith("/admin")) return "ADMIN";
  if (pathname.startsWith("/patient")) return "PATIENT";
  if (pathname.startsWith("/nurse")) return "NURSE";
  return "DOCTOR";
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { user } = useAuthSnapshot();

  const role = user?.role ?? inferRoleFromPathname(pathname);
  const navItems = NAV_ITEMS_BY_ROLE[role];
  const othersItems = OTHERS_ITEMS_BY_ROLE[role];
  const appTitle = APP_TITLE_BY_ROLE[role];
  const dashboardPath = getDashboardPath(role);

  const renderMenuItems = (
    items: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={` ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <CaretDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed flex flex-col justify-between mt-16 pb-6 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-card text-white border-r border-cultured h-screen transition-all duration-300 ease-in-out z-50
        ${
          isMobileOpen
            ? "w-full lg:w-[290px]"
            : isExpanded || isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div>
        <div
          className={`py-8 flex  ${
            !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
        >
          <Link href={dashboardPath}>
            {isExpanded || isHovered || isMobileOpen ? (
              <>
                <div className="flex items-center gap-x-1">
                  <div className="w-5 h-5 bg-gradient-primary rounded-full flex items-center justify-center">
                    <FirstAidIcon size={11} className="text-white" weight="fill" />
                  </div>
                  <div className="flex items-start justify-start gap-x-1">
                    <h3 className="text-xl font-medium tracking-tight text-white">{appTitle}</h3>
                    <p className="font-medium text-white">&reg;</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-5 h-5 bg-gradient-primary rounded-full flex items-center justify-center">
                <FirstAidIcon size={11} className="text-white" weight="fill" />
              </div>
            )}
          </Link>
        </div>
        <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
          <nav className="mb-6">
            <div className="flex flex-col gap-4">
              <div>
                {renderMenuItems(navItems, "main")}
              </div>

              {othersItems.length ? (
                <div className="">
                  <h2
                    className={`mb-4 text-xs uppercase flex leading-[20px] ${
                      !isExpanded && !isHovered
                        ? "lg:justify-center"
                        : "justify-start"
                    }`}
                  >
                    {isExpanded || isHovered || isMobileOpen ? (
                      "Others"
                    ) : (
                      <DotsNineIcon />
                    )}
                  </h2>
                  {renderMenuItems(othersItems, "others")}
                </div>
              ) : null}
            </div>
          </nav>
          <SidebarWidget expanded={isExpanded} hover={isHovered} mobile={isMobileOpen}/>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
