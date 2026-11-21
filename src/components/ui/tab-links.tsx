import Link from "next/link";
import { cn } from "cn";

export function TabLinks({
  tabs,
  active,
}: {
  tabs: { value: string; label: string; href: string; count?: number }[];
  active: string;
}) {
  return (
    <div className="inline-flex gap-1 rounded-full bg-card p-1">
      {tabs.map((tab) => {
        const selected = tab.value === active;
        return (
          <Link
            key={tab.value}
            href={tab.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200",
              selected
                ? "bg-dark text-white"
                : "text-muted-foreground hover:bg-white hover:text-foreground",
            )}
          >
            {tab.label}
            {typeof tab.count === "number" ? (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[11px] tabular-nums",
                  selected ? "bg-white/15 text-white" : "bg-white text-ink-subtle",
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
