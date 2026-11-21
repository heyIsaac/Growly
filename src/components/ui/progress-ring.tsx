export function ProgressRing({
  value,
  label,
  size = 88,
}: {
  value: number;
  label?: string;
  size?: number;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const stroke = Math.max(8, Math.round(size * 0.09));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const percentSize = Math.max(14, Math.round(size * 0.22));
  const labelSize = Math.max(10, Math.round(size * 0.075));

  return (
    <div className="relative inline-flex items-center justify-center rounded-full bg-white">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground">
        <span className="leading-none font-semibold" style={{ fontSize: percentSize }}>
          {clamped}%
        </span>
        {label ? (
          <span className="mt-1 text-muted-foreground" style={{ fontSize: labelSize }}>
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
