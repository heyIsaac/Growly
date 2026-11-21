"use client";

import { useLayoutEffect, useRef, useState } from "react";

export type CyclePoint = {
  id: string;
  label: string;
  self: number | null;
  leader: number | null;
};

const SLOT = 168;
const HEIGHT = 280;
const PAD = { top: 16, bottom: 36, x: 72 };

function yAt(value: number, max: number, plotH: number) {
  return PAD.top + (1 - value / max) * plotH;
}

export function CycleEvolutionChart({
  points,
  max,
}: {
  points: CyclePoint[];
  max: number;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);
  const [active, setActive] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const measure = () => setContainerW(el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const ticks = Array.from({ length: max + 1 }, (_, index) => index);
  const width = Math.max(containerW, points.length * SLOT, 1);
  const xAt = (index: number) => {
    if (points.length <= 1) return width / 2;
    const inner = width - PAD.x * 2;
    return PAD.x + (index / (points.length - 1)) * inner;
  };
  const slot = points.length <= 1 ? width : width / points.length;

  function line(key: "self" | "leader") {
    return points
      .map((point, index) => {
        const value = point[key];
        if (value == null) return null;
        return `${xAt(index)},${yAt(value, max, plotH)}`;
      })
      .filter(Boolean)
      .join(" ");
  }

  const hasSelf = points.some((point) => point.self != null);
  const hasLeader = points.some((point) => point.leader != null);
  const hovered = active == null ? null : points[active];
  const tooltipLeft = active == null ? 0 : (xAt(active) / width) * 100;
  const flipTooltip = tooltipLeft > 62;

  if (!points.length) {
    return <p className="text-sm text-muted-foreground">Esta competência ainda não entrou em um ciclo.</p>;
  }

  return (
    <div>
      <div className="flex">
        <svg width="36" height={HEIGHT} className="shrink-0" aria-hidden>
          {ticks.map((tick) => (
            <text
              key={tick}
              x="28"
              y={yAt(tick, max, plotH) + 4}
              textAnchor="end"
              className="fill-muted-foreground text-[11px]"
            >
              {tick}
            </text>
          ))}
        </svg>
        <div
          ref={scrollerRef}
          className="min-w-0 flex-1 overflow-x-auto"
          onMouseLeave={() => setActive(null)}
        >
          {containerW > 0 ? (
            <div className="relative" style={{ width, height: HEIGHT }}>
              <svg
                width={width}
                height={HEIGHT}
                viewBox={`0 0 ${width} ${HEIGHT}`}
                className="block"
                role="img"
                aria-label="Evolução por ciclo"
              >
                {ticks.map((tick) => (
                  <line
                    key={tick}
                    x1="0"
                    x2={width}
                    y1={yAt(tick, max, plotH)}
                    y2={yAt(tick, max, plotH)}
                    className="text-border"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                ))}
                {hasSelf ? (
                  <polyline
                    points={line("self")}
                    fill="none"
                    className="text-primary"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                ) : null}
                {hasLeader ? (
                  <polyline
                    points={line("leader")}
                    fill="none"
                    className="text-accent-strong"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                ) : null}
                {points.map((point, index) => (
                  <g key={point.id}>
                    {point.self != null ? (
                      <circle cx={xAt(index)} cy={yAt(point.self, max, plotH)} r="5" className="fill-primary" />
                    ) : null}
                    {point.leader != null ? (
                      <circle
                        cx={xAt(index)}
                        cy={yAt(point.leader, max, plotH)}
                        r="5"
                        className="fill-accent-strong"
                      />
                    ) : null}
                    <text
                      x={xAt(index)}
                      y={HEIGHT - 12}
                      textAnchor="middle"
                      className="fill-foreground text-[11px] font-semibold tracking-wide uppercase"
                    >
                      {point.label}
                    </text>
                    <rect
                      x={xAt(index) - slot / 2}
                      y="0"
                      width={slot}
                      height={HEIGHT - PAD.bottom}
                      fill="transparent"
                      onMouseEnter={() => setActive(index)}
                    />
                  </g>
                ))}
                {hovered && active != null ? (
                  <line
                    x1={xAt(active)}
                    x2={xAt(active)}
                    y1={PAD.top}
                    y2={HEIGHT - PAD.bottom}
                    className="text-ink-subtle"
                    stroke="currentColor"
                    strokeDasharray="3 4"
                    pointerEvents="none"
                  />
                ) : null}
              </svg>
              {hovered && active != null ? (
                <div
                  className="pointer-events-none absolute top-2 z-10 w-36 rounded-2xl bg-dark px-3 py-2.5 text-white shadow-[0_12px_30px_rgb(20_19_17/0.25)]"
                  style={
                    flipTooltip
                      ? { right: `${100 - tooltipLeft}%`, marginRight: 14 }
                      : { left: `${tooltipLeft}%`, marginLeft: 14 }
                  }
                >
                  <p className="text-xs font-semibold">{hovered.label}</p>
                  {hovered.self != null ? (
                    <p className="mt-1 text-xs text-white/70">Autoavaliação {hovered.self}</p>
                  ) : null}
                  {hovered.leader != null ? (
                    <p className="text-xs text-white/70">Líder {hovered.leader}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <div style={{ height: HEIGHT }} />
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        {hasSelf ? (
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="h-0.5 w-6 rounded-full bg-primary" />
            Autoavaliação
          </span>
        ) : null}
        {hasLeader ? (
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-6 rounded-full bg-accent-strong" />
            Líder
          </span>
        ) : null}
      </div>
    </div>
  );
}
