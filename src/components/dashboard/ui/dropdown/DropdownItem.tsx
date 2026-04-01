import type React from "react";
import Link from "next/link";

interface DropdownItemProps {
  tag?: "a" | "button";
  href?: string;
  onClick?: () => void;
  onItemClick?: () => void;
  baseClassName?: string;
  className?: string;
  children: React.ReactNode;
  variant: boolean
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  tag = "button",
  href,
  onClick,
  onItemClick,
  className = "",
  variant,
  baseClassName,
  children,
}) => {
  const computedBaseClass =
    baseClassName ??
    `block w-full text-left px-4 py-2 text-sm text-gray-700 ${
      variant ? "hover:bg-blue-50 hover:text-blue-600" : "hover:bg-red-100 hover:text-red-600"
    } transition-all duration-400`;
  const combinedClasses = `${computedBaseClass} ${className}`.trim();

  const handleClick = (event: React.MouseEvent) => {
    if (tag === "button") {
      event.preventDefault();
    }
    if (onClick) onClick();
    if (onItemClick) onItemClick();
  };

  if (tag === "a" && href) {
    return (
      <Link href={href} className={combinedClasses} onClick={handleClick}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={handleClick} className={combinedClasses}>
      {children}
    </button>
  );
};
