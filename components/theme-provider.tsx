"use client"

import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import type React from "react";

// Definimos los valores posibles para `attribute` según lo que soporta `next-themes`
type ThemeAttribute = "class" | "data-theme";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: "dark" | "light" | "system";
  attribute?: ThemeAttribute; // Restringimos los valores posibles
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
  attribute = "class",
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

export const useTheme = () => {
  const { theme, setTheme } = useNextTheme();
  return {
    theme: theme as "dark" | "light" | "system",
    setTheme: setTheme as (theme: "dark" | "light" | "system") => void,
  };
};