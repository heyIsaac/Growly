import type { ReactNode } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { Sidebar } from "@/components/layout/sidebar";
import { PageTransition } from "@/components/layout/page-transition";
import type { SessionUser } from "@/lib/db/queries/users";

export function AppShell({
  user,
  cycles,
  defaultCycleId,
  children,
}: {
  user: SessionUser;
  cycles: { id: string; name: string }[];
  defaultCycleId: string | null;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-shell">
      <aside className="fixed top-4 bottom-4 left-4 z-40 hidden w-[232px] md:block">
        <Sidebar role={user.role} user={user} showEvolution={cycles.length >= 2} />
      </aside>
      <div className="flex min-h-screen flex-col md:pl-[256px]">
        <TopBar user={user} cycles={cycles} defaultCycleId={defaultCycleId} />
        <main className="min-w-0 flex-1 px-4 pt-3 pb-12 md:px-6 lg:px-8">
          <div className="w-full">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
