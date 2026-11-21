"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/sidebar";
import type { UserRole } from "@/lib/authz/roles";

export function MobileNav({ role, showEvolution = false }: { role: UserRole; showEvolution?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Abrir navegação"
        className="inline-flex size-10 items-center justify-center rounded-full bg-white text-foreground ring-1 ring-border"
      >
        <Menu className="size-4" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[268px] rounded-r-[1.75rem] bg-shell p-3">
        <SheetHeader className="sr-only">
          <SheetTitle>Navegação</SheetTitle>
        </SheetHeader>
        <Sidebar role={role} showEvolution={showEvolution} />
      </SheetContent>
    </Sheet>
  );
}
