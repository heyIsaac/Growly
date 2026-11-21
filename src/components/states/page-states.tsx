import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[1.75rem] bg-card px-6 py-12 text-center",
        className,
      )}
    >
      <div className="mb-3 size-12 rounded-full bg-accent-wash" />
      <h2 className="text-base font-medium">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function ErrorState({
  title = "Algo deu errado",
  description = "Tente novamente em instantes.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-[1.75rem] bg-card px-6 py-10 text-center">
      <h2 className="text-base font-medium text-destructive">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="h-24 w-full max-w-md animate-pulse rounded-[1.75rem] bg-card" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-48 animate-pulse rounded-[1.75rem] bg-card" />
        <div className="h-48 animate-pulse rounded-[1.75rem] bg-card" />
        <div className="h-48 animate-pulse rounded-[1.75rem] bg-card" />
      </div>
    </div>
  );
}
