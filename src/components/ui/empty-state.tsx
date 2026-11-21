import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  children,
  action,
}: {
  icon: LucideIcon;
  children: ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 pb-[8vh] text-center">
      <Icon className="mb-5 size-14 shrink-0" color="#56700f" strokeWidth={2} />
      <p className="max-w-sm text-base leading-relaxed text-muted-foreground">{children}</p>
      {action ? (
        <Link
          href={action.href}
          className="mt-5 inline-flex h-11 items-center rounded-full bg-dark px-5 text-sm font-medium text-white transition-all hover:-translate-y-px"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
