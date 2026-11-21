"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth/client";
import { ROLE_LABELS, type UserRole } from "@/lib/authz/roles";

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function UserMenu({
  name,
  title,
  role,
  avatarUrl,
}: {
  name: string;
  title: string | null;
  role: UserRole;
  avatarUrl: string | null;
}) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function signOut() {
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left outline-none transition-colors hover:bg-[#fafaf8]"
      >
        <Avatar>
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
          <AvatarFallback>{initials(name)}</AvatarFallback>
        </Avatar>
        <span className="hidden leading-tight sm:block">
          <span className="block text-sm font-medium">{name}</span>
          <span className="block text-xs text-muted-foreground">{title ?? ROLE_LABELS[role]}</span>
        </span>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute inset-x-0 bottom-full z-50 mb-2 rounded-[1.25rem] bg-white p-1.5 shadow-[var(--shadow-card)] ring-1 ring-border"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => void signOut()}
            className="flex w-full items-center gap-2 rounded-[0.9rem] px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-card"
          >
            <LogOut className="size-4 text-ink-subtle" />
            Sair
          </button>
        </div>
      ) : null}
    </div>
  );
}
