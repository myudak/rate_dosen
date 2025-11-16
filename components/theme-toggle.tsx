"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { flushSync } from "react-dom";

import { Button } from "@/components/ui/button";

type ThemeValue = "light" | "dark" | "system";
const THEME_SEQUENCE: ThemeValue[] = ["light", "dark", "system"];
const VIEW_TRANSITION_DURATION = 500;

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const prefersReducedMotion = React.useCallback(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) {
      return false;
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const animateThemeTransition = React.useCallback(
    async (nextTheme: ThemeValue) => {
      const startViewTransition = document.startViewTransition?.bind(document);
      const target = buttonRef.current;

      if (!startViewTransition || !target || prefersReducedMotion()) {
        setTheme(nextTheme);
        return;
      }

      const rect = target.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const maxRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const transition = startViewTransition(() => {
        flushSync(() => {
          setTheme(nextTheme);
        });
      });

      try {
        await transition.ready;
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: VIEW_TRANSITION_DURATION,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          }
        );
        await transition.finished;
      } catch {
        // no-op: fallback if the transition is interrupted
      }
    },
    [prefersReducedMotion, setTheme]
  );

  const cycleTheme = React.useCallback(async () => {
    const currentTheme = (theme as ThemeValue) ?? "light";
    const nextIndex =
      (THEME_SEQUENCE.indexOf(currentTheme) + 1) % THEME_SEQUENCE.length;
    const nextTheme = THEME_SEQUENCE[nextIndex];

    await animateThemeTransition(nextTheme);
  }, [animateThemeTransition, theme]);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const iconTheme: ThemeValue =
    theme === "system"
      ? "system"
      : ((resolvedTheme ?? theme) as ThemeValue) ?? "light";

  return (
    <Button
      ref={buttonRef}
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="relative"
    >
      <Sun
        className={`h-[1.2rem] w-[1.2rem] absolute transition-all
${
  iconTheme === "light"
    ? "animate-fade-in animate-rotate-in"
    : "opacity-0 animate-fade-out"
}`}
      />
      <Moon
        className={`h-[1.2rem] w-[1.2rem] absolute transition-all
${
  iconTheme === "dark"
    ? "animate-fade-in animate-rotate-in"
    : "opacity-0 animate-fade-out"
}`}
      />
      <Monitor
        className={`h-[1.2rem] w-[1.2rem] absolute transition-all
${
  iconTheme === "system"
    ? "animate-fade-in animate-rotate-in"
    : "opacity-0 animate-fade-out"
}`}
      />
      <span className="sr-only">Toggle Theme</span>
    </Button>
  );
}
