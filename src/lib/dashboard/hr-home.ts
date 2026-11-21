import { pickDisplayedCycle } from "@/lib/dashboard/pick-cycle";
import { companySnapshot } from "@/lib/db/queries/dashboard";
import { listCycleParticipants, listCycles } from "@/lib/db/queries/cycles";
import { listPeople, listSkills, listTeams } from "@/lib/db/queries/directory";
import { listEmployeeSkills } from "@/lib/db/queries/development";
import { listEvaluations } from "@/lib/db/queries/evaluations";
import { findCompanySubscription } from "@/lib/db/queries/subscriptions";
import { planById } from "@/lib/billing/plans";

export async function loadHrDashboard(companyId: string, cicloId?: string) {
  const [stats, skills, evaluations, cycles, people, teamRows, skillRows, subscription] =
    await Promise.all([
      companySnapshot(companyId),
      listEmployeeSkills(companyId),
      listEvaluations(companyId),
      listCycles(companyId),
      listPeople(companyId),
      listTeams(companyId),
      listSkills(companyId),
      findCompanySubscription(companyId),
    ]);

  const draftCycle = cycles.find((cycle) => cycle.status === "DRAFT");
  const onboarding = [
    {
      id: "teams",
      label: "Criar os times da empresa",
      done: teamRows.some((team) => team.name !== "Geral"),
      href: "/times",
    },
    {
      id: "people",
      label: "Convidar líderes e colaboradores",
      done: people.length > 1,
      href: "/pessoas",
    },
    {
      id: "skills",
      label: "Revisar as competências avaliadas",
      done: skillRows.length > 0,
      href: "/competencias",
    },
    {
      id: "cycle",
      label: "Criar o primeiro ciclo",
      done: cycles.length > 0,
      href: "/ciclos",
    },
    {
      id: "start",
      label: "Iniciar o ciclo de avaliação",
      done: cycles.some((cycle) => cycle.status !== "DRAFT"),
      href: draftCycle ? `/ciclos/${draftCycle.id}` : "/ciclos",
    },
  ];

  const bySkill = new Map<
    string,
    { name: string; total: number; count: number; prevTotal: number; prevCount: number; scaleMax: number }
  >();
  for (const skill of skills) {
    const current = bySkill.get(skill.skillId) ?? {
      name: skill.name,
      total: 0,
      count: 0,
      prevTotal: 0,
      prevCount: 0,
      scaleMax: skill.scaleMax,
    };
    current.total += skill.currentLevel;
    current.count += 1;
    if (skill.previousLevel != null) {
      current.prevTotal += skill.previousLevel;
      current.prevCount += 1;
    }
    bySkill.set(skill.skillId, current);
  }

  const currentCycle = pickDisplayedCycle(cycles, cicloId);

  const participants = currentCycle
    ? await listCycleParticipants(companyId, currentCycle.id)
    : [];

  const cycleEvaluations = currentCycle
    ? evaluations.filter((item) => item.cycleId === currentCycle.id)
    : [];

  const byEmployee = new Map<
    string,
    { employeeId: string; name: string; detail: string; done: boolean }
  >();
  for (const person of participants) {
    byEmployee.set(person.employeeId, {
      employeeId: person.employeeId,
      name: person.name,
      detail: currentCycle?.name ?? "",
      done: true,
    });
  }
  for (const item of cycleEvaluations) {
    const current = byEmployee.get(item.employeeId) ?? {
      employeeId: item.employeeId,
      name: item.employeeName,
      detail: item.cycleName,
      done: true,
    };
    current.done = current.done && item.status === "SUBMITTED";
    byEmployee.set(item.employeeId, current);
  }
  for (const [employeeId, current] of byEmployee) {
    const rows = cycleEvaluations.filter((item) => item.employeeId === employeeId);
    current.done = rows.length > 0 && rows.every((item) => item.status === "SUBMITTED");
  }

  const attentionItems: {
    employeeId: string;
    name: string;
    kind: "self" | "leader" | "both" | "gap" | "invite";
    label: string;
    href: string;
  }[] = [];

  for (const person of byEmployee.values()) {
    const rows = cycleEvaluations.filter((item) => item.employeeId === person.employeeId);
    const selfOk = rows.some((item) => item.type === "SELF" && item.status === "SUBMITTED");
    const leaderOk = rows.some((item) => item.type === "LEADER" && item.status === "SUBMITTED");
    const href = currentCycle
      ? `/avaliacoes/${currentCycle.id}?employee=${person.employeeId}&type=${selfOk ? "LEADER" : "SELF"}`
      : "/people/avaliacoes";

    if (!selfOk && !leaderOk) {
      attentionItems.push({
        employeeId: person.employeeId,
        name: person.name,
        kind: "both",
        label: "Faltam autoavaliação e avaliação do líder",
        href,
      });
    } else if (!selfOk) {
      attentionItems.push({
        employeeId: person.employeeId,
        name: person.name,
        kind: "self",
        label: "Falta a autoavaliação",
        href,
      });
    } else if (!leaderOk) {
      attentionItems.push({
        employeeId: person.employeeId,
        name: person.name,
        kind: "leader",
        label: "Falta a avaliação do líder",
        href,
      });
    } else if (currentCycle?.status === "COMPARISON") {
      attentionItems.push({
        employeeId: person.employeeId,
        name: person.name,
        kind: "gap",
        label: "Pronto para a conversa de GAP",
        href: `/avaliacoes/${currentCycle.id}?employee=${person.employeeId}&type=SELF`,
      });
    }
  }

  const invitedPeople = people
    .filter((person) => person.userStatus === "INVITED")
    .map((person) => ({
      employeeId: person.employeeId,
      name: person.name,
      title: person.title,
    }));

  for (const person of invitedPeople) {
    attentionItems.push({
      employeeId: person.employeeId,
      name: person.name,
      kind: "invite",
      label: "Ainda não fez o primeiro acesso",
      href: `/pessoas/${person.employeeId}`,
    });
  }

  const peopleCount = Math.max(participants.length, byEmployee.size);
  const selfDone = cycleEvaluations.filter(
    (item) => item.type === "SELF" && item.status === "SUBMITTED",
  ).length;
  const leaderDone = cycleEvaluations.filter(
    (item) => item.type === "LEADER" && item.status === "SUBMITTED",
  ).length;

  const teamCounts = new Map<string, number>();
  for (const person of people) {
    const key = person.teamName ?? "Sem time";
    teamCounts.set(key, (teamCounts.get(key) ?? 0) + 1);
  }

  return {
    stats,
    chart: [...bySkill.values()].map((skill) => ({
      label: skill.name,
      value: skill.count ? Math.round((skill.total / skill.count) * 10) / 10 : 0,
      previous: skill.prevCount ? Math.round((skill.prevTotal / skill.prevCount) * 10) / 10 : null,
      max: skill.scaleMax,
    })),
    cycleOptions: cycles.map((cycle) => ({ id: cycle.id, name: cycle.name })),
    cycle: currentCycle
      ? {
          id: currentCycle.id,
          name: currentCycle.name,
          status: currentCycle.status,
          startsAt: currentCycle.startsAt.toISOString(),
          endsAt: currentCycle.endsAt.toISOString(),
          peopleCount,
          selfDone,
          leaderDone,
        }
      : null,
    pendingPeople: [...byEmployee.values()],
    attention: attentionItems,
    invited: invitedPeople,
    teams: [...teamCounts.entries()].map(([name, count]) => ({ name, count })),
    onboarding,
    subscription: subscription
      ? {
          planName: planById(subscription.plan).name,
          seats: subscription.seats,
          seatsUsed: stats.people,
          monthlyCents: subscription.monthlyCents,
          since: subscription.createdAt.toISOString(),
        }
      : null,
  };
}
