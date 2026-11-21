"use client";

import { Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function FormDrawer({
  label,
  title,
  description,
  submitLabel = "Salvar",
  action,
  children,
}: {
  label: string;
  title: string;
  description?: string;
  submitLabel?: string;
  action: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex h-10 items-center gap-1.5 rounded-full bg-dark px-4 text-sm font-medium text-white transition-all hover:bg-foreground active:translate-y-px">
        <Plus className="size-4" />
        {label}
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full gap-0 rounded-l-[1.75rem] border-none bg-shell p-0 shadow-[var(--shadow-float)] data-[side=right]:sm:max-w-[460px]"
      >
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle className="text-lg">{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        <form
          action={async (formData) => {
            await action(formData);
            setOpen(false);
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-3.5 overflow-y-auto px-6 pb-6">{children}</div>
          <SheetFooter className="bg-white/60 px-6 py-4">
            <button
              type="submit"
              className="h-11 rounded-full bg-primary px-5 text-sm font-medium text-dark transition-all hover:bg-primary-hover active:translate-y-px"
            >
              {submitLabel}
            </button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
