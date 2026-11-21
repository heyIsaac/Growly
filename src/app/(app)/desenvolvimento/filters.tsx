"use client";

import { ListFilter, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { fieldClass, ghostButtonClass, labelClass, primaryButtonClass } from "@/components/ui/field";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const SITUATIONS = [
  { value: "", label: "Todas" },
  { value: "com-pdi", label: "Com PDI" },
  { value: "sem-plano", label: "Sem plano" },
  { value: "andamento", label: "Em andamento" },
  { value: "concluido", label: "Concluído" },
];

export function DevelopmentFilters({
  teams,
  basePath = "/people/desenvolvimento",
}: {
  teams: string[];
  basePath?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const situacao = searchParams.get("situacao") ?? "";
  const time = searchParams.get("time") ?? "";
  const active = Boolean(situacao || time);

  function push(next: URLSearchParams) {
    const query = next.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  }

  function patch(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    push(next);
  }

  function clearFilters() {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("situacao");
    next.delete("time");
    push(next);
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          patch("q", String(form.get("q") ?? "").trim());
        }}
      >
        <div className="relative w-[15.5rem]">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-subtle" />
          <input
            name="q"
            defaultValue={searchParams.get("q") ?? ""}
            placeholder="Buscar"
            className="h-10 w-full rounded-full border-0 bg-card pr-4 pl-10 text-sm outline-none transition-colors placeholder:text-ink-subtle hover:bg-border focus:bg-white focus:ring-1 focus:ring-border"
          />
        </div>
      </form>

      <Sheet>
        <SheetTrigger
          aria-label="Filtros"
          className="relative inline-flex size-10 items-center justify-center rounded-full bg-card text-foreground transition-colors hover:bg-border"
        >
          <ListFilter className="size-4" />
          {active ? (
            <span className="absolute top-2 right-2 size-1.5 rounded-full bg-primary" />
          ) : null}
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-full gap-0 rounded-l-[1.75rem] border-none bg-shell p-0 shadow-[var(--shadow-float)] data-[side=right]:sm:max-w-[400px]"
        >
          <SheetHeader className="px-6 pt-6 pb-4">
            <SheetTitle className="text-lg">Filtros</SheetTitle>
            <SheetDescription>Afine os gráficos por situação e time.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 space-y-4 px-6 pb-6">
            <div>
              <label className={labelClass}>Situação</label>
              <select
                value={situacao}
                onChange={(event) => patch("situacao", event.target.value)}
                className={fieldClass}
              >
                {SITUATIONS.map((item) => (
                  <option key={item.value || "todas"} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Time</label>
              <select
                value={time}
                onChange={(event) => patch("time", event.target.value)}
                className={fieldClass}
              >
                <option value="">Todos</option>
                {teams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <SheetFooter className="flex-row bg-white/60 px-6 py-4">
            <button type="button" onClick={clearFilters} className={ghostButtonClass}>
              Limpar
            </button>
            <SheetTrigger className={primaryButtonClass}>Aplicar</SheetTrigger>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
