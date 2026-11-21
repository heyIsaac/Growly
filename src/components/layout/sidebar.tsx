"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/authz/roles";
import { navSectionsForRole } from "@/components/layout/sidebar-nav-config";
import { Logo } from "@/components/brand/logo";
import { UserMenu } from "@/components/layout/user-menu";
import type { SessionUser } from "@/lib/db/queries/users";

function itemActive(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href === "/people" || href === "/dashboard") return false;
  if (
    (href === "/avaliacoes" || href === "/evolucao" || href === "/pdi") &&
    pathname.startsWith("/people/")
  ) {
    return false;
  }
  return pathname.startsWith(`${href}/`);
}

export function Sidebar({
  role,
  user,
  showEvolution = false,
}: {
  role: UserRole;
  user?: SessionUser;
  showEvolution?: boolean;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const sections = navSectionsForRole(role, { showEvolution });

  return (
    <div className="flex h-full flex-col rounded-[1.75rem] bg-white p-3 ring-1 ring-border">
      <div className="px-2 pt-2">
        <Logo className="h-auto w-[86%]" />
      </div>
      <div className="mx-2 mt-7 mb-7 h-px bg-foreground/10" />

      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.id} className="flex flex-col gap-1">
            {section.title ? (
              <p className="px-3 pb-1 text-[10px] font-medium tracking-[0.14em] text-ink-subtle uppercase">
                {section.title}
              </p>
            ) : null}
            {section.items.map((item) => {
              const active = itemActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-full px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                    active
                      ? "bg-dark text-white"
                      : "text-muted-foreground hover:bg-card hover:text-foreground",
                  )}
                >
                  <item.icon
                    className={cn(
                      "size-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                      active ? "text-primary" : "text-ink-subtle",
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {user ? (
        <div className="mt-3 border-t border-border pt-3">
          <UserMenu
            name={user.name}
            title={user.title}
            role={user.role}
            avatarUrl={user.avatarUrl}
          />
        </div>
      ) : null}
    </div>
  );
}
