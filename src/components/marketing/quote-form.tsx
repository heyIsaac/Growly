"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { cn } from "cn";
import { requestQuote } from "@/lib/actions/quotes";
import { PLANS, formatBRL, type PlanId } from "@/lib/billing/plans";
import { fieldClass, labelClass, primaryButtonClass } from "@/components/ui/field";

export function QuoteForm({ initialPlan }: { initialPlan: PlanId }) {
  const [planId, setPlanId] = useState<PlanId>(initialPlan);
  const plan = PLANS.find((item) => item.id === planId) ?? PLANS[1];
  const [seats, setSeats] = useState(String(plan.minSeats));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function choosePlan(next: PlanId) {
    const selected = PLANS.find((item) => item.id === next) ?? plan;
    setPlanId(next);
    setSeats((current) => {
      const value = Number(current);
      return !value || value < selected.minSeats ? String(selected.minSeats) : current;
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    const result = await requestQuote({
      plan: planId,
      seats,
      name: String(form.get("name") ?? ""),
      companyName: String(form.get("companyName") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      message: String(form.get("message") ?? ""),
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-[1.75rem] bg-white p-8 ring-1 ring-border sm:p-10">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary">
          <Check className="size-7 text-dark" strokeWidth={2.5} />
        </span>
        <h1 className="mt-6 text-[2rem] leading-tight font-semibold tracking-tight">Pedido enviado.</h1>
        <p className="mt-2 text-muted-foreground">
          Alguém do Growly entra em contato para conversar sobre o orçamento do plano {plan.name}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[1.75rem] bg-white p-6 ring-1 ring-border sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Solicitar orçamento</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Sem checkout. Conte o tamanho do time e alguém conversa com você para fechar o orçamento.
      </p>

      <fieldset className="mt-6">
        <legend className={labelClass}>Plano</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {PLANS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => choosePlan(item.id)}
              className={cn(
                "rounded-2xl px-3 py-3 text-left ring-1 transition-colors",
                item.id === planId ? "bg-dark text-white ring-dark" : "bg-canvas ring-border hover:bg-card",
              )}
            >
              <span className="block text-sm font-semibold">{item.name}</span>
              <span className={cn("mt-1 block text-xs", item.id === planId ? "text-white/60" : "text-muted-foreground")}>
                {formatBRL(item.pricePerSeatCents)} /pessoa
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label>
          <span className={labelClass}>Seu nome</span>
          <input name="name" required autoComplete="name" className={fieldClass} />
        </label>
        <label>
          <span className={labelClass}>Empresa</span>
          <input name="companyName" required autoComplete="organization" className={fieldClass} />
        </label>
        <label>
          <span className={labelClass}>E-mail</span>
          <input name="email" type="email" required autoComplete="email" className={fieldClass} />
        </label>
        <label>
          <span className={labelClass}>Telefone</span>
          <input name="phone" type="tel" autoComplete="tel" className={fieldClass} />
        </label>
        <label>
          <span className={labelClass}>Pessoas</span>
          <input
            name="seats"
            inputMode="numeric"
            required
            min={plan.minSeats}
            value={seats}
            onChange={(event) => setSeats(event.target.value)}
            className={fieldClass}
          />
          <span className="mt-1.5 block text-xs text-muted-foreground">
            Mínimo de {plan.minSeats} pessoas neste plano.
          </span>
        </label>
        <label className="sm:col-span-2">
          <span className={labelClass}>O que você quer conversar</span>
          <textarea
            name="message"
            rows={4}
            placeholder="Tamanho do time, prazo do ciclo, o que precisa avaliar."
            className="min-h-28 w-full rounded-[0.9rem] border border-border bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
          />
        </label>
      </div>

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

      <button type="submit" disabled={pending} className={cn(primaryButtonClass, "mt-6 w-full sm:w-auto")}>
        {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <ArrowRight className="mr-2 size-4" />}
        Solicitar orçamento
      </button>
    </form>
  );
}
