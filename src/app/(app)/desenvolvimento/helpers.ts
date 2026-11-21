export function planSituation(row: { planId: string | null; goalCount: number; doneCount: number }) {
  if (!row.planId) return { label: "Sem plano", status: "NOT_STARTED" };
  if (row.goalCount === 0) return { label: "Sem objetivos", status: "NOT_STARTED" };
  if (row.doneCount === row.goalCount) return { label: "Concluído", status: "DONE" };
  return { label: "Em andamento", status: "IN_PROGRESS" };
}

export function daysUntil(value: string | null) {
  if (!value) return null;
  const end = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - today.getTime()) / 86_400_000);
}

export function dueLabel(days: number) {
  if (days < 0) {
    const n = Math.abs(days);
    return `Atrasado há ${n} dia${n === 1 ? "" : "s"}`;
  }
  if (days === 0) return "Vence hoje";
  return `${days} dia${days === 1 ? "" : "s"} restantes`;
}
