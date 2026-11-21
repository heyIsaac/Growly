import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  action,
  className,
  children,
}: {
  label: string;
  value?: string;
  hint?: string;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rise-in rounded-[1.75rem] bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        {action}
      </div>
      {value ? (
        <p className="mt-3 text-[2rem] leading-none font-semibold tracking-tight tabular-nums">
          {value}
        </p>
      ) : null}
      {hint ? (
        <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
      ) : null}
      {children}
    </section>
  );
}
