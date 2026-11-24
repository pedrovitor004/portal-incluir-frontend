import type { CSSProperties } from "react";

export type ColorTheme = "green" | "amber" | "blue" | "red";
type ThemeStyle = CSSProperties & Record<`--accent-${string}`, string>;

export const colorThemes: Record<ColorTheme, ThemeStyle> = {
  green: { "--accent-soft": "#e8f5e9", "--accent-main": "#287535", "--accent-hover": "#205e2b", "--accent-ring": "#c8e4cd" },
  amber: { "--accent-soft": "#fffbeb", "--accent-main": "#92400e", "--accent-hover": "#78350f", "--accent-ring": "#fde68a" },
  blue: { "--accent-soft": "#f0f9ff", "--accent-main": "#0369a1", "--accent-hover": "#075985", "--accent-ring": "#bae6fd" },
  red: { "--accent-soft": "#fef2f2", "--accent-main": "#b91c1c", "--accent-hover": "#991b1b", "--accent-ring": "#fecaca" },
};
