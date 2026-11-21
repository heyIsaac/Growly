import { requireUser } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { pickDisplayedCycle } from "@/lib/dashboard/pick-cycle";
import { listCycles } from "@/lib/db/queries/cycles";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const cycles = await listCycles(user.companyId);
  const current = pickDisplayedCycle(cycles);
  return (
    <AppShell
      user={user}
      cycles={cycles.map((cycle) => ({ id: cycle.id, name: cycle.name }))}
      defaultCycleId={current?.id ?? null}
    >
      {children}
    </AppShell>
  );
}
