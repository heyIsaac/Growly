import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";
import type { CycleReport } from "./cycle-report";

const insightSchema = z.object({
  insights: z
    .array(
      z.object({
        title: z.string(),
        text: z.string(),
      }),
    )
    .length(3),
});

export type CycleInsight = z.infer<typeof insightSchema>["insights"][number];

function average(values: number[]) {
  if (!values.length) return null;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function fallbackInsights(report: CycleReport): CycleInsight[] {
  const withGap = report.skills.filter((skill) => skill.gap != null);
  const widest = [...withGap].sort((a, b) => Math.abs(b.gap ?? 0) - Math.abs(a.gap ?? 0))[0];
  const selfAvg = average(report.skills.flatMap((skill) => (skill.self == null ? [] : [skill.self])));
  const leaderAvg = average(
    report.skills.flatMap((skill) => (skill.leader == null ? [] : [skill.leader])),
  );

  return [
    {
      title: "Cobertura do ciclo",
      text: `${report.selfDone} de ${report.people.length} autoavaliações e ${report.leaderDone} de ${report.people.length} avaliações de líder foram enviadas. O relatório só considera notas enviadas.`,
    },
    {
      title: "Onde a nota se encontra",
      text:
        selfAvg == null
          ? "Ainda não há notas enviadas para calcular a média da empresa."
          : `A média das autoavaliações enviadas ficou em ${selfAvg}. A média do líder ficou em ${leaderAvg ?? "sem notas"}.`,
    },
    {
      title: widest ? `Maior distância em ${widest.name}` : "Próximo passo",
      text: widest
        ? `Em ${widest.name}, a autoavaliação ficou ${widest.gap && widest.gap > 0 ? "acima" : "abaixo"} da nota do líder, com diferença de ${widest.gap}. Vale abrir a conversa de gap por esse ponto.`
        : "Quando as duas notas estiverem enviadas, a distância entre autoavaliação e líder passa a indicar a conversa de gap.",
    },
  ];
}

export async function cycleInsights(report: CycleReport): Promise<CycleInsight[]> {
  if (!process.env.OPENAI_API_KEY) return fallbackInsights(report);

  const facts = {
    ciclo: report.cycle.name,
    pessoas: report.people.length,
    autoavaliacoesEnviadas: report.selfDone,
    avaliacoesDeLiderEnviadas: report.leaderDone,
    competencias: report.skills.map((skill) => ({
      nome: skill.name,
      auto: skill.self,
      lider: skill.leader,
      gap: skill.gap,
      escala: skill.scaleMax,
    })),
  };

  try {
    const result = await generateText({
      model: openai("gpt-5.4-mini"),
      output: Output.object({ schema: insightSchema }),
      system:
        "Você escreve o fechamento de um ciclo de avaliação para o time de People. Use só os números recebidos. Não invente pessoas, times nem causas. Português do Brasil, frases curtas e concretas. Três insights: cobertura, onde a empresa está, e o ponto que pede conversa.",
      prompt: JSON.stringify(facts),
    });
    return result.output.insights;
  } catch {
    return fallbackInsights(report);
  }
}
