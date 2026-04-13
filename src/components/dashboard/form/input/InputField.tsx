import React, { FC } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

interface InputProps {
  type?: "text" | "number" | "email" | "password" | "date" | "time" | string;
  id?: string;
  name?: string;
  placeholder?: string;
  defaultValue?: string | number;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  min?: string;
  max?: string;
  step?: number;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string; // Optional hint text
}

const Input: FC<InputProps> = ({
  type = "text",
  id,
  name,
  placeholder,
  defaultValue,
  value,
  onChange,
  className = "",
  min,
  max,
  step,
  disabled = false,
  success = false,
  error = false,
  hint,
}) => {
  // Determine input styles based on state (disabled, success, error)
  let inputClasses = `h-11 w-full rounded-lg border border-cultured bg-card py-2.5 pl-12 pr-14 text-sm text-white shadow-theme-xs placeholder:text-white/30  focus:outline-hidden focus:ring-3 focus:ring-brand-500/10  ${className}`;

  // Add styles for the different states
  if (disabled) {
    inputClasses += ` `;
  } else if (error) {
    inputClasses += ` `;
  } else if (success) {
    inputClasses += ` `;
  } else {
    inputClasses += ` `;
  }

  return (
    <div className="relative">
      <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none text-accent">
        <MagnifyingGlassIcon size={16} />
      </span>
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={inputClasses}
      />

      {/* Optional Hint Text */}
      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error
              ? "text-error-500"
              : success
              ? "text-success-500"
              : "text-gray-500"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default Input;
