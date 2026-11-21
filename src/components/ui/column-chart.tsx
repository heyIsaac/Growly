import { cn } from "cn";

function formatScore(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function ColumnChart({
  items,
  prominent = false,
}: {
  items: { label: string; value: number; max: number }[];
  highlight?: string;
  barHeight?: string;
  prominent?: boolean;
}) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">Sem dados para o gráfico.</p>;
  }

  return (
    <div className={prominent ? "space-y-2" : "space-y-3"}>
      {items.map((item, index) => {
        const ratio = item.max === 0 ? 0 : Math.min(1, item.value / item.max);
        return (
          <div
            key={item.label}
            className={cn(
              "group/bar grid items-center gap-4 transition-colors duration-200",
              prominent
                ? "grid-cols-[minmax(7rem,0.8fr)_minmax(0,1.4fr)_auto] rounded-[1.2rem] bg-white px-4 py-3.5"
                : "grid-cols-[8.5rem_minmax(0,1fr)_2.5rem] rounded-[1.1rem] px-4 py-2 hover:bg-white/70",
            )}
          >
            <span
              className={cn(
                "truncate transition-colors duration-200",
                prominent
                  ? "text-xs font-semibold tracking-[0.06em] uppercase"
                  : "text-sm text-muted-foreground group-hover/bar:text-foreground",
              )}
            >
              {item.label}
            </span>
            <div
              className={cn(
                "overflow-hidden rounded-full",
                prominent ? "chart-track-light h-6" : "chart-track h-6",
              )}
            >
              <div
                className="bar-in h-full"
                style={{
                  width: `${Math.max(10, ratio * 100)}%`,
                  animationDelay: `${index * 70}ms`,
                }}
              >
                <div
                  className={cn(
                    "chart-bar h-full rounded-full",
                    prominent ? "bg-accent-strong" : "bg-primary",
                  )}
                />
              </div>
            </div>
            <span
              className={cn(
                "text-right tabular-nums",
                prominent
                  ? "text-[1.35rem] leading-none font-semibold tracking-tight"
                  : "text-xs text-muted-foreground transition-colors duration-200 group-hover/bar:font-medium group-hover/bar:text-accent-strong",
              )}
            >
              {prominent ? formatScore(item.value) : item.value}
              <span className={prominent ? "ml-0.5 text-sm font-medium text-muted-foreground" : undefined}>
                /{item.max}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function EvolutionChart({
  items,
}: {
  items: { label: string; previous: number | null; current: number; max: number }[];
}) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">Sem dados de evolução ainda.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const previous = item.previous ?? 0;
        const currentRatio = item.max === 0 ? 0 : Math.min(1, item.current / item.max);
        const previousRatio = item.max === 0 ? 0 : Math.min(1, previous / item.max);
        const delta = item.previous == null ? null : item.current - item.previous;
        return (
          <div
            key={item.label}
            className="group/bar grid grid-cols-[8.5rem_minmax(0,1fr)_2.75rem] items-center gap-3 rounded-[1.1rem] px-4 py-2 transition-colors duration-200 hover:bg-white/70"
          >
            <span className="truncate text-sm text-muted-foreground transition-colors duration-200 group-hover/bar:text-foreground">
              {item.label}
            </span>
            <div className="relative h-6 overflow-hidden rounded-full">
              <div className="chart-track absolute inset-0 rounded-full" />
              <div
                className="bar-in absolute inset-y-0 left-0 rounded-full bg-primary/45"
                style={{
                  width: `${Math.max(8, previousRatio * 100)}%`,
                  animationDelay: `${index * 70}ms`,
                }}
              />
              <div
                className="bar-in absolute inset-y-0 left-0"
                style={{
                  width: `${Math.max(10, currentRatio * 100)}%`,
                  animationDelay: `${index * 70 + 80}ms`,
                }}
              >
                <div className="chart-bar h-full rounded-full bg-primary" />
              </div>
            </div>
            <span
              className={cn(
                "text-right text-xs tabular-nums",
                delta == null
                  ? "text-muted-foreground"
                  : delta > 0
                    ? "font-medium text-accent-strong"
                    : delta < 0
                      ? "text-muted-foreground"
                      : "text-muted-foreground",
              )}
            >
              {delta == null ? `${item.current}/${item.max}` : delta > 0 ? `+${delta}` : String(delta)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function Meter({
  value,
  max,
  delay = 0,
  tone = "accent",
}: {
  value: number;
  max: number;
  delay?: number;
  tone?: "accent" | "dark";
}) {
  const width = max === 0 ? 0 : Math.min(100, (value / max) * 100);
  return (
    <div className="chart-track h-2 overflow-hidden rounded-full">
      <div
        className="bar-in h-full"
        style={{ width: `${width}%`, animationDelay: `${delay}ms` }}
      >
        <div
          className={cn(
            "chart-bar h-full rounded-full transition-all duration-300",
            tone === "accent" ? "bg-primary" : "bg-dark group-hover/meter:bg-primary",
          )}
        />
      </div>
    </div>
  );
}

export function SegmentBars({
  segments,
}: {
  segments: { label: string; value: string; tone: "accent" | "dark" | "muted" }[];
}) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {segments.map((segment) => (
        <div key={segment.label} className="flex items-center gap-2">
          <span
            className={cn(
              "size-1.5 shrink-0 rounded-full",
              segment.tone === "accent" && "bg-primary",
              segment.tone === "dark" && "bg-dark",
              segment.tone === "muted" && "bg-ink-subtle/40",
            )}
          />
          <span className="text-[11px] tracking-wide text-ink-subtle uppercase">
            {segment.label}
          </span>
          <span className="text-[11px] tabular-nums text-muted-foreground">{segment.value}</span>
        </div>
      ))}
    </div>
  );
}
