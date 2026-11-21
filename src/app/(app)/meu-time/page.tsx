import { requireRole } from "@/lib/auth/session";
import { loadLeaderDashboard } from "@/lib/dashboard/leader-home";
import { LeaderDashboardView } from "../dashboard/dashboards";

export default async function MyTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ ciclo?: string }>;
}) {
  const user = await requireRole(["LEADER"]);
  const { ciclo } = await searchParams;
  const dashboard = await loadLeaderDashboard(user.companyId, user.employeeId, ciclo);
  return <LeaderDashboardView user={user} {...dashboard} />;
}
