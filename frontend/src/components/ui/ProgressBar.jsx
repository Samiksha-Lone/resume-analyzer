import React from 'react';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const ProgressBar = ({
  value = 0,
  className,
  variant = "primary",
  size = "md",
  ...props
}) => {
  const variants = {
    primary: "bg-accent",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
  };

  const sizes = {
    sm: "h-1",
    md: "h-2",
    lg: "h-4",
  };

  return (
    <div
      className={cn(
        "w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden",
        sizes[size],
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full transition-all duration-500 ease-out",
          variants[variant]
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

export default ProgressBar;
