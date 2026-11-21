export function pickDisplayedCycle<T extends { id: string; status: string }>(
  cycles: T[],
  cicloId?: string,
) {
  return (
    cycles.find((cycle) => cycle.id === cicloId) ??
    cycles.find((cycle) => cycle.status !== "CLOSED" && cycle.status !== "DRAFT") ??
    cycles.find((cycle) => cycle.status !== "CLOSED") ??
    cycles[0] ??
    null
  );
}
