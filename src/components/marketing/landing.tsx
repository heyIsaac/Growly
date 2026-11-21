import Link from "next/link";
import { ArrowRight, Check, ClipboardList, GitCompare, TrendingUp } from "lucide-react";
import { cn } from "cn";
import { Logo } from "@/components/brand/logo";
import { PLANS, formatBRL } from "@/lib/billing/plans";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Abra o ciclo",
    text: "O RH escolhe as competências e convida o time. Cada pessoa faz sua autoavaliação.",
  },
  {
    icon: GitCompare,
    title: "Compare percepções",
    text: "O líder avalia e o Growly mostra onde as visões se alinham e onde há GAP.",
  },
  {
    icon: TrendingUp,
    title: "Transforme em PDI",
    text: "Cada pessoa sai do ciclo com objetivos claros e acompanha a própria evolução.",
  },
];

export function Landing() {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo className="h-9" />
        <nav className="flex items-center gap-2">
          <a href="#planos" className="hidden px-3 text-sm text-muted-foreground hover:text-foreground sm:inline">
            Planos
          </a>
          <Link
            href="/sign-in"
            className="rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-card"
          >
            Entrar
          </Link>
          <Link
            href="/orcamento"
            className="rounded-full bg-dark px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-foreground"
          >
            Solicitar orçamento
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pt-10 pb-16 md:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="inline-flex rounded-full bg-accent-wash px-3 py-1 text-xs font-semibold tracking-wide text-accent-strong uppercase">
                Desenvolvimento contínuo
              </p>
              <h1 className="mt-5 text-[2.6rem] leading-[1.05] font-semibold tracking-tight md:text-[3.6rem]">
                Avaliações que viram evolução de verdade.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                O Growly organiza o ciclo de avaliação do seu time, compara a visão de cada pessoa com
                a do líder e termina em um plano de desenvolvimento.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/orcamento?plano=crescimento"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-dark transition-colors hover:bg-primary-hover"
                >
                  Solicitar orçamento
                  <ArrowRight className="size-4" />
                </Link>
                <a
                  href="#como-funciona"
                  className="inline-flex h-12 items-center rounded-full bg-white px-6 text-sm font-medium ring-1 ring-border transition-colors hover:bg-card"
                >
                  Como funciona
                </a>
              </div>
            </div>

            <div className="rounded-[2rem] bg-dark p-6 text-white">
              <p className="text-sm text-white/60">Ciclo 2026.2 · Engenharia</p>
              <p className="mt-1 text-2xl font-semibold">Comparação de percepções</p>
              <div className="mt-6 space-y-4">
                {[
                  { name: "Colaboração", self: 4, leader: 3 },
                  { name: "Comunicação", self: 4, leader: 4 },
                  { name: "Entrega", self: 3, leader: 4 },
                  { name: "Qualidade técnica", self: 5, leader: 4 },
                ].map((row) => (
                  <div key={row.name}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span>{row.name}</span>
                      <span className="text-white/60 tabular-nums">
                        {row.self} · {row.leader}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="chart-track h-2 rounded-full">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${row.self * 20}%` }} />
                      </div>
                      <div className="chart-track h-2 rounded-full">
                        <div className="h-full rounded-full bg-accent-strong" style={{ width: `${row.leader * 20}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-4 text-xs text-white/60">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-primary" /> Colaborador
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-accent-strong" /> Líder
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-8 px-6 py-16">
          <h2 className="text-[2rem] font-semibold tracking-tight">Como funciona</h2>
          <p className="mt-2 text-muted-foreground">Um ciclo, três etapas, do convite ao PDI.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title} className="rounded-[1.75rem] bg-card p-6">
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-full bg-primary">
                    <step.icon className="size-5 text-dark" />
                  </span>
                  <span className="text-sm font-semibold text-ink-subtle tabular-nums">0{index + 1}</span>
                </div>
                <p className="mt-6 text-lg font-semibold">{step.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="planos" className="mx-auto max-w-6xl scroll-mt-8 px-6 py-16">
          <h2 className="text-[2rem] font-semibold tracking-tight">Planos</h2>
          <p className="mt-2 text-muted-foreground">
            Referência por pessoa ativa. O orçamento fecha numa conversa, sem checkout.
          </p>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-[1.75rem] p-6",
                  plan.highlight ? "bg-dark text-white" : "bg-white ring-1 ring-border",
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold">{plan.name}</p>
                  {plan.highlight ? (
                    <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-dark">
                      Mais escolhido
                    </span>
                  ) : null}
                </div>
                <p className={cn("mt-1 text-sm", plan.highlight ? "text-white/60" : "text-muted-foreground")}>
                  {plan.pitch}
                </p>
                <p className="mt-6 text-[2.4rem] leading-none font-semibold tracking-tight">
                  {formatBRL(plan.pricePerSeatCents)}
                  <span className={cn("ml-1 text-sm font-medium", plan.highlight ? "text-white/50" : "text-muted-foreground")}>
                    /pessoa/mês
                  </span>
                </p>
                <p className={cn("mt-2 text-xs", plan.highlight ? "text-white/50" : "text-muted-foreground")}>
                  A partir de {plan.minSeats} pessoas
                </p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className={cn("mt-0.5 size-4 shrink-0", plan.highlight ? "text-primary" : "text-accent-strong")} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/orcamento?plano=${plan.slug}`}
                  className={cn(
                    "mt-8 inline-flex h-11 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                    plan.highlight
                      ? "bg-primary text-dark hover:bg-primary-hover"
                      : "bg-card hover:bg-accent-wash hover:text-accent-strong",
                  )}
                >
                  Solicitar orçamento
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-sm text-muted-foreground">
        Growly · Projeto acadêmico FIAP Startup One
      </footer>
    </div>
  );
}
