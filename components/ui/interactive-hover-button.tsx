import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function InteractiveHoverButton({
  children,
  className,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const hoverEnabled = !disabled;

  return (
    <button
      className={cn(
        "cursor-pointer group relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-primary/5 px-6 py-3 text-base font-semibold text-foreground transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-70",
        className
      )}
      disabled={disabled}
      {...props}
    >
      <span
        className={cn(
          "flex w-full items-center justify-center gap-2 text-foreground transition-all duration-300 ease-out",
          hoverEnabled && "group-hover:-translate-y-2 group-hover:opacity-0"
        )}
      >
        {children}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 flex w-full items-center justify-center gap-2 bg-primary text-primary-foreground opacity-0 transition-all duration-300 ease-out",
          hoverEnabled &&
            "translate-y-full group-hover:translate-y-0 group-hover:opacity-100"
        )}
      >
        {children}
        {hoverEnabled && <ArrowRight className="h-4 w-4" />}
      </span>
    </button>
  );
}
