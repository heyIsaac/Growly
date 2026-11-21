import { cn } from "cn";

export function Logo({ className }: { className?: string }) {
  return (
    <img
      src="/growly-logo.svg"
      alt="Growly"
      className={cn("h-8 w-auto", className)}
    />
  );
}
