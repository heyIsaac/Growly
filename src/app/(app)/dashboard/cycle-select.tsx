"use client";

import { ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const CYCLE_PAGES = ["/people", "/meu-time"];

export function HeaderCycleSelect({
  cycles,
  defaultCycleId,
}: {
  cycles: { id: string; name: string }[];
  defaultCycleId: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const visible = CYCLE_PAGES.includes(pathname);

  if (!visible || cycles.length === 0) return null;

  const requested = searchParams.get("ciclo");
  const value = cycles.some((cycle) => cycle.id === requested)
    ? requested!
    : (defaultCycleId ?? cycles[0].id);

  return (
    <span className="relative">
      <select
        aria-label="Ciclo"
        value={value}
        onChange={(event) => router.push(`${pathname}?ciclo=${event.target.value}`)}
        className="h-10 max-w-52 appearance-none truncate rounded-full bg-white py-0 pr-9 pl-4 text-sm font-medium ring-1 ring-border outline-none transition-colors hover:bg-card"
      >
        {cycles.map((cycle) => (
          <option key={cycle.id} value={cycle.id}>
            {cycle.name}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-ink-muted" />
    </span>
  );
}
