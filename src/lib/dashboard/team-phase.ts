export type TeamPhase = "self" | "leader" | "done";

export const TEAM_PHASES: { id: TeamPhase; label: string; hint: string }[] = [
  { id: "self", label: "Autoavaliação", hint: "Ainda não enviou a autoavaliação" },
  { id: "leader", label: "Avaliação do líder", hint: "A autoavaliação chegou. Falta a sua." },
  { id: "done", label: "Concluído", hint: "As duas avaliações já foram enviadas" },
];

export function teamPhase(person: {
  selfStatus: string | null;
  leaderStatus: string | null;
}): TeamPhase {
  if (person.selfStatus !== "SUBMITTED") return "self";
  if (person.leaderStatus !== "SUBMITTED") return "leader";
  return "done";
}
