import React, { FC } from "react";
import { IconProps } from "@phosphor-icons/react";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  success?: boolean;
  error?: boolean;
  hint?: string; // Optional hint text
  icon?: React.ElementType<IconProps>;
}

const Input: FC<InputProps> = ({
  type = "text",
  onChange,
  className = "",
  disabled = false,
  success = false,
  error = false,
  hint,
  icon: Icon,
  ...rest
}) => {
  // Determine input styles based on state (disabled, success, error)
  let inputClasses = `h-11 w-full rounded-lg border border-cultured bg-card py-2.5 pr-10 ${Icon ? 'pl-12' : 'pl-4'} pr-4 text-sm text-white shadow-theme-xs placeholder:text-white/30  focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 placeholder:text-xs ${className}`;

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
      {Icon && (
        <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none text-accent">
          <Icon size={16} />
        </span>
      )}
      <input
        type={type}
        onChange={onChange}
        disabled={disabled}
        className={inputClasses}
        {...rest}
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
