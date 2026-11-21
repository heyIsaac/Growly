import Link from "next/link";
import { FileDown } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { listCycles } from "@/lib/db/queries/cycles";
import { StatusPill, statusLabel, statusTone } from "@/components/ui/listing";
import { SoftCard } from "@/components/ui/surface";
import { PageIntro } from "../dashboard/dashboards";

function formatRange(startsAt: Date, endsAt: Date) {
  const format = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  return `${format.format(startsAt)} – ${format.format(endsAt)}`;
}

export default async function ReportsPage() {
  const user = await requireRole(["ADMIN"]);
  const cycles = await listCycles(user.companyId);
  const ordered = [...cycles].reverse();

  return (
    <div className="space-y-5">
      <PageIntro
        title="Relatórios"
        kicker="Um PDF ao fim de cada ciclo, com leitura, gráficos e a situação das pessoas"
      />
      {ordered.length === 0 ? (
        <p className="rounded-[1.75rem] bg-card px-4 py-10 text-center text-sm text-muted-foreground">
          Nenhum ciclo criado ainda.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ordered.map((cycle) => {
            const ready = cycle.status !== "DRAFT";
            return (
              <SoftCard key={cycle.id} className="flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[1.35rem] leading-tight font-semibold tracking-tight">{cycle.name}</p>
                  <StatusPill tone={statusTone(cycle.status)}>{statusLabel(cycle.status)}</StatusPill>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatRange(cycle.startsAt, cycle.endsAt)}
                </p>
                <div className="mt-6">
                  {ready ? (
                    <Link
                      href={`/api/relatorios/${cycle.id}`}
                      className="inline-flex h-10 items-center gap-1.5 rounded-full bg-dark px-4 text-sm font-medium text-white transition-colors hover:bg-dark/90"
                    >
                      <FileDown className="size-4" />
                      {cycle.status === "CLOSED" ? "Baixar PDF" : "Baixar prévia"}
                    </Link>
                  ) : (
                    <span className="text-sm text-ink-subtle">O PDF abre quando o ciclo sair de rascunho.</span>
                  )}
                </div>
              </SoftCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
