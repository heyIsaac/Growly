import type { ReactNode } from "react";
import { cn } from "cn";

export function SoftCard({
  children,
  className,
  tone = "surface",
}: {
  children: ReactNode;
  className?: string;
  tone?: "surface" | "white" | "dark" | "accent";
}) {
  return (
    <section
      className={cn(
        "rounded-[1.75rem] p-5",
        tone === "surface" && "bg-card",
        tone === "white" && "bg-white ring-1 ring-border",
        tone === "dark" && "bg-dark text-white",
        tone === "accent" && "bg-accent-wash",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardHead({
  title,
  hint,
  action,
  tone = "light",
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <p className={cn("text-[1.6rem] leading-tight font-semibold tracking-tight", tone === "dark" && "text-white")}>
          {title}
        </p>
        {hint ? (
          <p className={cn("mt-1.5 text-sm leading-snug", tone === "dark" ? "text-white/60" : "text-muted-foreground")}>
            {hint}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Chip({
  children,
  tone = "white",
}: {
  children: ReactNode;
  tone?: "white" | "dark" | "accent" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap",
        tone === "white" && "bg-white text-foreground ring-1 ring-border",
        tone === "dark" && "bg-dark text-white",
        tone === "accent" && "bg-primary text-dark",
        tone === "muted" && "bg-card text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

export function RowList({ children }: { children: ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

export function Row({
  children,
  className,
  tone = "white",
}: {
  children: ReactNode;
  className?: string;
  tone?: "white" | "surface";
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-[1.1rem] px-4 py-3 transition-all",
        tone === "white" ? "bg-white hover:shadow-[var(--shadow-card)]" : "bg-card hover:bg-white",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function BigNumber({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rise-in min-w-[120px] rounded-[1.5rem] bg-card px-5 py-4">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-2 text-[2.15rem] leading-none font-semibold tracking-tight text-accent-strong tabular-nums">
        {value}
      </p>
    </div>
  );
}
