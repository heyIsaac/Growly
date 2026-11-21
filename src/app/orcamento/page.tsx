import { QuoteForm } from "@/components/marketing/quote-form";
import { planBySlug } from "@/lib/billing/plans";

export default async function OrcamentoPage({ searchParams }: PageProps<"/orcamento">) {
  const { plano } = await searchParams;
  const plan = planBySlug(typeof plano === "string" ? plano : null);
  return <QuoteForm initialPlan={plan.id} />;
}
