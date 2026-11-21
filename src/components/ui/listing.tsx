import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { cn } from "cn";

export { Chip } from "@/components/ui/surface";

function gridTemplate(count: number) {
  if (count <= 1) return "minmax(0,1fr)";
  if (count === 2) return "minmax(12rem,1.2fr) minmax(0,1fr)";
  if (count === 3) return "minmax(13rem,1.3fr) minmax(0,1fr) minmax(6.5rem,0.8fr)";
  return `minmax(14rem,1.45fr) repeat(${count - 2}, minmax(0,1fr)) minmax(8rem,0.95fr)`;
}

export function ListCard({
  columns,
  children,
  className,
}: {
  columns?: string[];
  children: ReactNode;
  className?: string;
}) {
  const count = columns?.length ?? 1;

  return (
    <div className={cn("rounded-[1.75rem] bg-card p-3", className)}>
      <div
        className="grid gap-y-2"
        style={{ gridTemplateColumns: gridTemplate(count) } as CSSProperties}
      >
        {columns?.length ? (
          <div className="col-span-full hidden grid-cols-subgrid px-4 pt-1 pb-2 md:grid">
            {columns.map((column, index) => (
              <span
                key={`${column}-${index}`}
                className="text-left text-[11px] font-medium tracking-wide text-ink-subtle uppercase"
              >
                {column}
              </span>
            ))}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}

export function ListRow({
  children,
  className,
  href,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
}) {
  const classes = cn(
    "rise-in col-span-full flex flex-col gap-3 rounded-[1.15rem] bg-white px-4 py-3 text-sm transition-all duration-200 hover:-translate-y-px hover:shadow-[var(--shadow-card)] md:grid md:grid-cols-subgrid md:items-center md:gap-4",
    className,
  );
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return <div className={classes}>{children}</div>;
}

export function Cell({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return <div className={cn("min-w-0", className)}>{children}</div>;
}

export function StatusPill({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "accent" | "dark" | "success" | "warning";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] leading-4 font-medium tracking-wide whitespace-nowrap",
        tone === "muted" && "bg-card text-muted-foreground",
        tone === "accent" && "bg-accent-wash text-accent-strong",
        tone === "dark" && "bg-dark text-white",
        tone === "success" && "bg-[#e6eee3] text-[#4c6847]",
        tone === "warning" && "bg-[#f3eadc] text-[#8a6840]",
      )}
    >
      {children}
    </span>
  );
}

export function EmptyRow({ children }: { children: ReactNode }) {
  return (
    <p className="col-span-full rounded-[1.15rem] bg-white px-4 py-8 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

export function statusTone(status: string) {
  switch (status) {
    case "ACTIVE":
    case "SUBMITTED":
    case "CLOSED":
      return "success" as const;
    case "INVITED":
    case "DRAFT":
    case "SELF_EVALUATION":
    case "LEADER_EVALUATION":
      return "warning" as const;
    case "COMPARISON":
    case "IN_PROGRESS":
      return "accent" as const;
    case "DONE":
      return "success" as const;
    case "NOT_STARTED":
    case "CANCELLED":
      return "muted" as const;
    default:
      return "muted" as const;
  }
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "RH",
  LEADER: "Líder",
  EMPLOYEE: "Colaborador",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Ativo",
  INVITED: "Convite",
  INACTIVE: "Inativo",
  DRAFT: "Rascunho",
  SUBMITTED: "Enviada",
  SELF_EVALUATION: "Autoavaliação",
  LEADER_EVALUATION: "Avaliação do líder",
  COMPARISON: "Comparação",
  CLOSED: "Encerrado",
  NOT_STARTED: "Não iniciado",
  IN_PROGRESS: "Em andamento",
  DONE: "Concluído",
  CANCELLED: "Cancelado",
};

const EVAL_TYPE_LABELS: Record<string, string> = {
  SELF: "Autoavaliação",
  LEADER: "Avaliação do líder",
};

export function roleLabel(role: string | null | undefined) {
  if (!role) return "—";
  return ROLE_LABELS[role] ?? role;
}

export function statusLabel(status: string | null | undefined) {
  if (!status) return "—";
  return STATUS_LABELS[status] ?? status;
}

export function evalTypeLabel(type: string | null | undefined) {
  if (!type) return "—";
  return EVAL_TYPE_LABELS[type] ?? type;
}
