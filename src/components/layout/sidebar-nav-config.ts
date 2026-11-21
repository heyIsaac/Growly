import {
  BarChart3,
  ClipboardList,
  Flag,
  LayoutDashboard,
  Target,
  TrendingUp,
  UserCircle2,
  Users,
  UsersRound,
  Building2,
} from "lucide-react";
import type { UserRole } from "@/lib/authz/roles";

export type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: UserRole[];
};

export type NavSection = {
  id: string;
  title?: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    id: "personal",
    items: [
      {
        href: "/dashboard",
        label: "Visão geral",
        icon: LayoutDashboard,
        roles: ["ADMIN", "LEADER", "EMPLOYEE"],
      },
      {
        href: "/avaliacoes",
        label: "Minhas avaliações",
        icon: ClipboardList,
        roles: ["ADMIN", "LEADER", "EMPLOYEE"],
      },
      {
        href: "/evolucao",
        label: "Evolução",
        icon: TrendingUp,
        roles: ["ADMIN", "LEADER", "EMPLOYEE"],
      },
      {
        href: "/pdi",
        label: "PDI",
        icon: Flag,
        roles: ["ADMIN", "LEADER", "EMPLOYEE"],
      },
      {
        href: "/perfil",
        label: "Meu perfil",
        icon: UserCircle2,
        roles: ["ADMIN", "LEADER", "EMPLOYEE"],
      },
    ],
  },
  {
    id: "team",
    title: "Meu time",
    items: [
      {
        href: "/meu-time",
        label: "Visão do time",
        icon: UsersRound,
        roles: ["LEADER"],
      },
    ],
  },
  {
    id: "people",
    title: "Área de People",
    items: [
      {
        href: "/people",
        label: "Visão da empresa",
        icon: Building2,
        roles: ["ADMIN"],
      },
      {
        href: "/pessoas",
        label: "Pessoas",
        icon: Users,
        roles: ["ADMIN"],
      },
      {
        href: "/times",
        label: "Times e cargos",
        icon: UsersRound,
        roles: ["ADMIN"],
      },
      {
        href: "/ciclos",
        label: "Ciclos",
        icon: ClipboardList,
        roles: ["ADMIN"],
      },
      {
        href: "/people/avaliacoes",
        label: "Avaliações da empresa",
        icon: ClipboardList,
        roles: ["ADMIN"],
      },
      {
        href: "/people/desenvolvimento",
        label: "Evolução da empresa",
        icon: TrendingUp,
        roles: ["ADMIN"],
      },
      {
        href: "/relatorios",
        label: "Relatórios",
        icon: BarChart3,
        roles: ["ADMIN"],
      },
      {
        href: "/competencias",
        label: "Competências",
        icon: Target,
        roles: ["ADMIN"],
      },
    ],
  },
];

export function navSectionsForRole(role: UserRole, options?: { showEvolution?: boolean }) {
  const showEvolution = options?.showEvolution ?? false;
  return NAV_SECTIONS.map((section) => ({
    ...section,
    title: section.id === "personal" && role === "LEADER" ? "Você" : section.title,
    items: section.items.filter((item) => {
      if (item.href === "/evolucao" && !showEvolution) return false;
      return item.roles.includes(role);
    }),
  })).filter((section) => section.items.length > 0);
}
