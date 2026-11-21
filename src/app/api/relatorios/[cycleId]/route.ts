import { getAuthenticatedUser } from "@/lib/auth/session";
import { cycleInsights } from "@/lib/reports/insights";
import { loadCycleReport } from "@/lib/reports/cycle-report";
import { renderCyclePdf } from "@/lib/reports/pdf";

export const maxDuration = 60;

function fileName(name: string) {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `relatorio-${slug || "ciclo"}.pdf`;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ cycleId: string }> },
) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "ADMIN") {
    return new Response("Não autorizado", { status: 401 });
  }

  const { cycleId } = await context.params;
  const report = await loadCycleReport(user.companyId, user.companyName, cycleId);
  if (!report) return new Response("Ciclo não encontrado", { status: 404 });
  if (report.cycle.status === "DRAFT") {
    return new Response("O relatório abre quando o ciclo sai de rascunho.", { status: 409 });
  }

  const insights = await cycleInsights(report);
  const pdf = await renderCyclePdf(report, insights);

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName(report.cycle.name)}"`,
    },
  });
}
