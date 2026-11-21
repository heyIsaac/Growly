import { listDirectReports } from "@/lib/db/queries/directory";
import type { SessionUser } from "@/lib/db/queries/users";

export async function resolveDevelopmentTarget(user: SessionUser, selectedId?: string) {
  const reports =
    user.role === "LEADER" && user.employeeId
      ? await listDirectReports(user.companyId, user.employeeId)
      : [];
  const allowed =
    selectedId &&
    (user.role === "ADMIN" || reports.some((report) => report.employeeId === selectedId));
  const targetId = allowed ? selectedId : user.employeeId;
  const person = reports.find((report) => report.employeeId === targetId);
  return {
    targetId,
    readOnly: Boolean(targetId && targetId !== user.employeeId),
    personName: person?.name ?? null,
  };
}
