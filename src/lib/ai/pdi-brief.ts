import { listSkills } from "@/lib/db/queries/directory";
import { listSkillCycleScores } from "@/lib/db/queries/development";

type Score = { self: number | null; leader: number | null; cycle: string; max: number };

export async function buildPdiBrief(companyId: string, employeeId: string, name: string) {
  const [catalog, scores] = await Promise.all([
    listSkills(companyId),
    listSkillCycleScores(companyId, employeeId),
  ]);

  const latest = new Map<string, Score & { at: number; name: string }>();
  for (const row of scores) {
    const at = row.startsAt.getTime();
    const current = latest.get(row.skillId);
    if (!current || at > current.at) {
      latest.set(row.skillId, {
        name: row.skillName,
        max: row.scaleMax,
        cycle: row.cycleName,
        self: null,
        leader: null,
        at,
      });
    }
    const slot = latest.get(row.skillId);
    if (!slot || slot.cycle !== row.cycleName) continue;
    if (row.type === "SELF") slot.self = row.level;
    if (row.type === "LEADER") slot.leader = row.level;
  }

  const lines = catalog.map((skill) => {
    const score = latest.get(skill.id);
    if (!score) return `- ${skill.name} (id ${skill.id}): sem nota enviada neste ciclo`;
    const gap =
      score.self != null && score.leader != null ? score.self - score.leader : null;
    const gapText = gap == null ? "sem par autoavaliação/líder" : `GAP ${gap > 0 ? "+" : ""}${gap}`;
    return `- ${skill.name} (id ${skill.id}): autoavaliação ${score.self ?? "–"}, líder ${score.leader ?? "–"}, ${gapText}, ciclo ${score.cycle}, escala até ${score.max}`;
  });

  const ranked = [...latest.values()].filter((score) => score.self != null && score.leader != null);
  ranked.sort((a, b) => b.self! - b.leader! - (a.self! - a.leader!));
  const focus = ranked[0];

  return [
    `Pessoa: ${name}.`,
    focus
      ? `Maior GAP: ${focus.name}, autoavaliação ${focus.self} e líder ${focus.leader} no ${focus.cycle}. Comece por essa competência, a menos que a pessoa queira outra.`
      : "Ainda não há um par de autoavaliação e avaliação do líder. Pergunte qual competência a pessoa quer desenvolver.",
    "Competências da empresa:",
    ...lines,
  ].join("\n");
}
