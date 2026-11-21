import { requireRole } from "@/lib/auth/session";
import { loadHrDashboard } from "@/lib/dashboard/hr-home";
import { HrDashboardView } from "../dashboard/dashboards";

export default async function PeopleHomePage({
  searchParams,
}: {
  searchParams: Promise<{ ciclo?: string }>;
}) {
  const user = await requireRole(["ADMIN"]);
  const { ciclo } = await searchParams;
  const dashboard = await loadHrDashboard(user.companyId, ciclo);

  return <HrDashboardView user={user} {...dashboard} />;
}
