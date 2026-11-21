import { cn } from "cn";

export const CYCLE_STAGES = [
  { id: "DRAFT", label: "Rascunho" },
  { id: "SELF_EVALUATION", label: "Auto" },
  { id: "LEADER_EVALUATION", label: "Líder" },
  { id: "COMPARISON", label: "GAP" },
  { id: "CLOSED", label: "Fim" },
] as const;

function stageIndex(status: string) {
  if (status === "FEEDBACK") return 3;
  const index = CYCLE_STAGES.findIndex((stage) => stage.id === status);
  return index < 0 ? 0 : index;
}

export function CycleStageBar({
  status,
  preview = false,
}: {
  status?: string;
  preview?: boolean;
}) {
  const current = preview ? -1 : stageIndex(status ?? "DRAFT");

  return (
    <div className="flex gap-1">
      {CYCLE_STAGES.map((stage, index) => {
        const done = !preview && index < current;
        const active = !preview && index === current;
        return (
          <div key={stage.id} className="min-w-0 flex-1">
            <div
              className={cn(
                "h-1.5 rounded-full",
                preview && "bg-primary/35",
                done && "bg-primary",
                active && "bg-primary",
                !preview && !done && !active && "bg-[#e4e1da]",
              )}
            />
            <p
              className={cn(
                "mt-1.5 truncate text-center text-[10px] font-medium tracking-wide uppercase",
                active || preview ? "text-foreground" : "text-ink-subtle",
              )}
            >
              {stage.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
