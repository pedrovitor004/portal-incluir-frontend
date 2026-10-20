import type { ButtonHTMLAttributes, ReactNode } from "react";
import { colorThemes } from "../../config/uiThemes";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "soft";
  icon?: ReactNode;
  iconOnly?: boolean;
};
const variants = {
  primary: "border-transparent bg-[var(--accent-main)] text-white shadow-sm hover:bg-[var(--accent-hover)]",
  secondary: "border-[var(--accent-ring)] bg-white text-[var(--accent-main)] hover:bg-[var(--accent-soft)]",
  soft: "border-transparent bg-[var(--accent-soft)] text-[var(--accent-main)] hover:bg-[var(--accent-ring)]",
};
export default function Button({ variant = "primary", icon, iconOnly = false, className = "", children, style, type = "button", ...props }: Props) {
  return <button {...props} type={type} style={{ ...colorThemes.green, ...style }} className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition duration-150 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-main)] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0 motion-reduce:transform-none ${iconOnly ? "h-11 w-11 p-0" : "px-4 py-2.5"} ${variants[variant]} ${className}`}>
    {icon && <span aria-hidden="true" className="inline-flex h-4 w-4 shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full">{icon}</span>}{children}
  </button>;
}
