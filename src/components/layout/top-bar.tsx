"use client";

import { Suspense } from "react";
import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import { HeaderCycleSelect } from "@/app/(app)/dashboard/cycle-select";
import { MobileNav } from "@/components/layout/mobile-nav";
import type { SessionUser } from "@/lib/db/queries/users";

function todayParts() {
  const now = new Date();
  const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "long" })
    .format(now)
    .replace("-feira", "");
  const date = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
  }).format(now);
  return { weekday, date };
}

export function TopBar({
  user,
  cycles,
  defaultCycleId,
}: {
  user: SessionUser;
  cycles: { id: string; name: string }[];
  defaultCycleId: string | null;
}) {
  const pathname = usePathname();
  const showDate = pathname === "/dashboard";
  const { weekday, date } = todayParts();

  return (
    <header>
      <div className="flex w-full items-center justify-between gap-3 px-4 pt-5 pb-1 md:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <MobileNav role={user.role} showEvolution={cycles.length >= 2} />
          </div>
          {showDate ? (
            <p
              className="hidden items-baseline gap-2 text-[11px] font-semibold uppercase sm:flex"
              suppressHydrationWarning
            >
              <span className="tracking-[0.2em] text-foreground">{weekday}</span>
              <span className="h-3 w-px bg-border" aria-hidden />
              <span className="tracking-[0.16em] text-ink-subtle">{date}</span>
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Suspense fallback={null}>
            <HeaderCycleSelect cycles={cycles} defaultCycleId={defaultCycleId} />
          </Suspense>
          <button
            type="button"
            aria-label="Notificações"
            className="inline-flex size-10 items-center justify-center rounded-full bg-white text-foreground ring-1 ring-border transition-colors hover:bg-card"
          >
            <Bell className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
