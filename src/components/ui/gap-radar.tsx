"use client";

import { useId, useState } from "react";
import { cn } from "cn";

export type GapRadarItem = {
  id: string;
  label: string;
  self: number | null;
  leader: number | null;
  max: number;
};

type Series = "self" | "leader";

const RADIUS = 200;
const INNER = 18;
const LABEL_BAND = 44;
const LABEL_RADIUS = RADIUS + LABEL_BAND / 2 + 4;
const WIDTH = 2 * (RADIUS + LABEL_BAND + 10);
const HEIGHT = WIDTH;
const CX = WIDTH / 2;
const CY = HEIGHT / 2;

function labelArc(a0: number, a1: number) {
  const mid = (((a0 + a1) / 2) % 360 + 360) % 360;
  const flip = mid > 90 && mid < 270;
  const radius = LABEL_RADIUS;
  const start = point(flip ? a1 : a0, radius);
  const end = point(flip ? a0 : a1, radius);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${large} ${flip ? 0 : 1} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

const SERIES: Record<Series, { label: string; fill: string; text: string }> = {
  self: { label: "Autoavaliação", fill: "var(--primary)", text: "text-foreground" },
  leader: { label: "Avaliação do Líder", fill: "var(--accent-strong)", text: "text-white" },
};

function point(angle: number, radius: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

function sector(r0: number, r1: number, a0: number, a1: number) {
  const large = a1 - a0 > 180 ? 1 : 0;
  const o0 = point(a0, r1);
  const o1 = point(a1, r1);
  const i1 = point(a1, r0);
  const i0 = point(a0, r0);
  return [
    `M ${o0.x.toFixed(2)} ${o0.y.toFixed(2)}`,
    `A ${r1} ${r1} 0 ${large} 1 ${o1.x.toFixed(2)} ${o1.y.toFixed(2)}`,
    `L ${i1.x.toFixed(2)} ${i1.y.toFixed(2)}`,
    `A ${r0} ${r0} 0 ${large} 0 ${i0.x.toFixed(2)} ${i0.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

function levelRadius(level: number, max: number) {
  return INNER + ((RADIUS - INNER) * level) / max;
}

function gapOf(item: GapRadarItem) {
  if (item.self == null || item.leader == null) return null;
  return item.self - item.leader;
}

function gapLabel(gap: number | null) {
  if (gap == null) return "Sem par";
  if (gap === 0) return "Alinhado";
  return `GAP ${gap > 0 ? "+" : ""}${gap}`;
}

export function GapRadar({
  items,
  labels,
}: {
  items: GapRadarItem[];
  labels?: Partial<Record<Series, string>>;
}) {
  const [active, setActive] = useState<number | null>(null);
  const [focusSeries, setFocusSeries] = useState<Series | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const uid = useId().replace(/:/g, "");

  if (items.length < 3) {
    return (
      <p className="text-sm text-muted-foreground">
        O radar aparece com pelo menos três competências avaliadas.
      </p>
    );
  }

  const step = 360 / items.length;
  const max = Math.max(...items.map((item) => item.max));
  const visibleSeries = (["self", "leader"] as const).filter((series) =>
    items.some((item) => item[series] != null),
  );
  const splitSeries = visibleSeries.length > 1;
  const pad = Math.min(2.2, step * 0.06);
  const activeItem = active == null ? null : items[active];
  const anchor = active == null ? null : point(active * step + step / 2, RADIUS + 8);
  const tooltipAt =
    cursor ??
    (anchor ? { x: (anchor.x / WIDTH) * 100, y: (anchor.y / HEIGHT) * 100 } : null);

  function seriesOpacity(series: Series, index: number) {
    if (focusSeries && focusSeries !== series) return 0.18;
    if (active != null && active !== index) return 0.28;
    return 1;
  }

  return (
    <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <div className="relative -mx-2 w-[calc(100%+1rem)] max-w-[560px] sm:mx-auto sm:w-full">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
          role="img"
          aria-label="Comparação entre a autoavaliação e a avaliação do líder"
          onMouseLeave={() => {
            setActive(null);
            setCursor(null);
          }}
          onMouseMove={(event) => {
            const box = event.currentTarget.getBoundingClientRect();
            setCursor({
              x: ((event.clientX - box.left) / box.width) * 100,
              y: ((event.clientY - box.top) / box.height) * 100,
            });
          }}
        >
          {items.map((item, index) => {
            const a0 = index * step + pad;
            const a1 = (index + 1) * step - pad;
            const mid = (a0 + a1) / 2;
            const isActive = active === index;
            return (
              <g
                key={item.id}
                tabIndex={0}
                className="cursor-pointer outline-none"
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
              >
                <path
                  d={sector(INNER, RADIUS + LABEL_BAND, a0 - pad, a1 + pad)}
                  fill={isActive ? "white" : "transparent"}
                  className="transition-[fill] duration-200"
                />
                <path
                  d={sector(RADIUS + 6, RADIUS + LABEL_BAND, a0, a1)}
                  fill={isActive ? "var(--primary)" : "rgb(20 19 17 / 0.045)"}
                  className="transition-[fill] duration-200"
                />

                {Array.from({ length: max }, (_, level) => (
                  <path
                    key={`track-${level}`}
                    d={sector(levelRadius(level, max) + 1.5, levelRadius(level + 1, max) - 1.5, a0, a1)}
                    fill="rgb(20 19 17 / 0.045)"
                  />
                ))}

                {visibleSeries.map((series, half) => {
                  const value = Math.max(0, Math.round(item[series] ?? 0));
                  const h0 = splitSeries ? (half === 0 ? a0 : mid + pad / 2) : a0;
                  const h1 = splitSeries ? (half === 0 ? mid - pad / 2 : a1) : a1;
                  return (
                    <g
                      key={series}
                      style={{ opacity: seriesOpacity(series, index) }}
                      className="transition-opacity duration-200"
                    >
                      {Array.from({ length: value }, (_, level) => (
                        <path
                          key={level}
                          d={sector(
                            levelRadius(level, max) + 1.5,
                            levelRadius(level + 1, max) - 1.5,
                            h0,
                            h1,
                          )}
                          fill={SERIES[series].fill}
                          className="gap-seg"
                          style={{ animationDelay: `${index * 50 + level * 60}ms` }}
                        />
                      ))}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {Array.from({ length: max }, (_, level) => {
            const r = levelRadius(level + 1, max);
            return (
              <text
                key={`level-${level}`}
                x={CX + 4}
                y={CY - r + 12}
                className="pointer-events-none fill-ink-subtle text-[14px] font-semibold tabular-nums sm:text-[10px]"
              >
                {level + 1}
              </text>
            );
          })}

          {items.map((item, index) => {
            const arcId = `${uid}-label-${index}`;
            return (
              <g key={`label-${item.id}`} className="pointer-events-none">
                <path id={arcId} d={labelArc(index * step, (index + 1) * step)} fill="none" />
                <text
                  dominantBaseline="middle"
                  className={cn(
                    "text-[17px] font-bold tracking-[0.08em] uppercase transition-colors duration-200",
                    active == null || active === index ? "fill-foreground" : "fill-foreground/35",
                  )}
                >
                  <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
                    {item.label}
                  </textPath>
                </text>
              </g>
            );
          })}
        </svg>

        {activeItem && tooltipAt ? (
          <div
            className={cn(
              "pointer-events-none absolute z-10 w-52 rounded-[1rem] bg-dark px-3.5 py-3 text-white shadow-[0_12px_30px_rgb(20_19_17/0.25)]",
              tooltipAt.x > 60 ? "-translate-x-[calc(100%+14px)]" : "translate-x-3.5",
              tooltipAt.y > 60 ? "-translate-y-[calc(100%+14px)]" : "translate-y-3.5",
            )}
            style={{ left: `${tooltipAt.x}%`, top: `${tooltipAt.y}%` }}
          >
            <p className="truncate text-sm font-semibold">{activeItem.label}</p>
            <div className="mt-2 space-y-1 text-xs">
              {visibleSeries.map((series) => (
                <p key={series} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-white/70">
                    <span
                      className="size-2 rounded-full"
                      style={{ background: series === "self" ? "var(--primary)" : "#9db347" }}
                    />
                    {labels?.[series] ?? SERIES[series].label}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {activeItem[series] ?? "—"}/{activeItem.max}
                  </span>
                </p>
              ))}
            </div>
            {splitSeries ? (
              <p className="mt-2 border-t border-white/10 pt-2 text-xs font-medium text-primary">
                {gapLabel(gapOf(activeItem))}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-x-5 gap-y-2 px-1">
          {visibleSeries.map((series) => (
            <span
              key={series}
              onMouseEnter={() => setFocusSeries(series)}
              onMouseLeave={() => setFocusSeries(null)}
              className={cn(
                "inline-flex cursor-default items-center gap-2 text-xs font-medium text-muted-foreground transition-opacity",
                focusSeries && focusSeries !== series && "opacity-40",
              )}
            >
              <span className="size-2.5 rounded-full" style={{ background: SERIES[series].fill }} />
              {labels?.[series] ?? SERIES[series].label}
            </span>
          ))}
        </div>

        <div className="space-y-2">
          {items.map((item, index) => {
            const gap = gapOf(item);
            return (
              <div
                key={item.id}
                onMouseEnter={() => setActive(index)}
                onMouseLeave={() => setActive(null)}
                className={cn(
                  "flex items-center gap-3 rounded-[1.1rem] px-4 py-3 transition-colors duration-200",
                  active === index ? "bg-white shadow-[var(--shadow-card)]" : "bg-white/60",
                )}
              >
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.label}</span>
                <span className="flex items-center gap-1.5 text-sm tabular-nums">
                  {visibleSeries.includes("self") ? (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-dark">
                      {item.self ?? "—"}
                    </span>
                  ) : null}
                  {visibleSeries.includes("leader") ? (
                    <span className="rounded-full bg-accent-strong px-2 py-0.5 text-xs font-semibold text-white">
                      {item.leader ?? "—"}
                    </span>
                  ) : null}
                </span>
                {splitSeries ? (
                  <span
                    className={cn(
                      "w-16 text-right text-xs font-medium",
                      gap ? "text-accent-strong" : "text-muted-foreground",
                    )}
                  >
                    {gapLabel(gap)}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
