export type PlanId = "ESSENTIAL" | "GROWTH" | "SCALE";

export type Plan = {
  id: PlanId;
  slug: string;
  name: string;
  pitch: string;
  pricePerSeatCents: number;
  minSeats: number;
  features: string[];
  highlight?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "ESSENTIAL",
    slug: "essencial",
    name: "Essencial",
    pitch: "Para começar a rodar ciclos de avaliação.",
    pricePerSeatCents: 1490,
    minSeats: 5,
    features: [
      "Autoavaliação e avaliação do líder",
      "Comparação de percepções",
      "PDI individual",
    ],
  },
  {
    id: "GROWTH",
    slug: "crescimento",
    name: "Crescimento",
    pitch: "Para times que querem acompanhar a evolução.",
    pricePerSeatCents: 2490,
    minSeats: 10,
    highlight: true,
    features: [
      "Tudo do Essencial",
      "Visão do líder e do RH por ciclo",
      "Relatórios de competências",
      "Competências personalizadas",
    ],
  },
  {
    id: "SCALE",
    slug: "escala",
    name: "Escala",
    pitch: "Para empresas com várias áreas e lideranças.",
    pricePerSeatCents: 3990,
    minSeats: 50,
    features: [
      "Tudo do Crescimento",
      "Times e cargos ilimitados",
      "Histórico completo de ciclos",
      "Suporte dedicado",
    ],
  },
];

export function planBySlug(slug: string | null | undefined) {
  return PLANS.find((plan) => plan.slug === slug) ?? PLANS[1];
}

export function planById(id: string) {
  return PLANS.find((plan) => plan.id === id) ?? PLANS[1];
}

export function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
