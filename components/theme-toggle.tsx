"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="relative"
    >
      <Sun
        className={`h-[1.2rem] w-[1.2rem] absolute transition-all
${
  theme === "light"
    ? "animate-fade-in animate-rotate-in"
    : "opacity-0 animate-fade-out"
}`}
      />
      <Moon
        className={`h-[1.2rem] w-[1.2rem] absolute transition-all
${
  theme === "dark"
    ? "animate-fade-in animate-rotate-in"
    : "opacity-0 animate-fade-out"
}`}
      />
      <Monitor
        className={`h-[1.2rem] w-[1.2rem] absolute transition-all
${
  theme === "system"
    ? "animate-fade-in animate-rotate-in"
    : "opacity-0 animate-fade-out"
}`}
      />
      <span className="sr-only">Toggle Theme</span>
    </Button>
  );
}
