import Link from "next/link";
import { Search } from "lucide-react";
import { createPerson } from "@/lib/actions/mutations";
import { requireRole } from "@/lib/auth/session";
import { listPeople, listRoles, listTeams } from "@/lib/db/queries/directory";
import { fieldClass, labelClass } from "@/components/ui/field";
import { FormDrawer } from "@/components/ui/form-drawer";
import { Cell, EmptyRow, ListCard, ListRow, StatusPill, roleLabel, statusLabel, statusTone } from "@/components/ui/listing";
import { PageIntro } from "../dashboard/dashboards";
import { PersonActions } from "./person-actions";

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireRole(["ADMIN"]);
  const { q } = await searchParams;
  const [people, teams, roles] = await Promise.all([
    listPeople(user.companyId, q),
    listTeams(user.companyId),
    listRoles(user.companyId),
  ]);

  return (
    <div className="space-y-5">
      <PageIntro
        title="Pessoas"
        kicker={`${people.length} no time`}
        action={
          <FormDrawer
            label="Nova pessoa"
            title="Cadastrar pessoa"
            description="O acesso é liberado no primeiro login com este e-mail."
            submitLabel="Cadastrar e convidar"
            action={createPerson}
          >
            <div>
              <label className={labelClass}>Nome</label>
              <input name="name" required className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>E-mail corporativo</label>
              <input name="email" type="email" required className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Papel no app</label>
              <select name="userRole" className={fieldClass}>
                <option value="EMPLOYEE">Colaborador</option>
                <option value="LEADER">Líder</option>
                <option value="ADMIN">RH / Admin</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Time</label>
                <select name="teamId" className={fieldClass}>
                  <option value="">Sem time</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Cargo</label>
                <select name="roleId" className={fieldClass}>
                  <option value="">Sem cargo</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.title}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Gestor</label>
              <select name="managerId" className={fieldClass}>
                <option value="">Sem gestor</option>
                {people.map((person) => (
                  <option key={person.employeeId} value={person.employeeId}>{person.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Área</label>
                <input name="area" className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Senioridade</label>
                <input name="seniority" className={fieldClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Admissão</label>
              <input name="hiredAt" type="date" className={fieldClass} />
            </div>
          </FormDrawer>
        }
      />

      <form className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-subtle" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome ou e-mail"
          className={`${fieldClass} pl-10`}
        />
      </form>

      <ListCard columns={["Pessoa", "Cargo", "Time", "Acesso", ""]}>
        {people.length === 0 ? <EmptyRow>Nenhuma pessoa encontrada.</EmptyRow> : null}
        {people.map((person) => (
          <ListRow key={person.employeeId}>
            <Cell className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-wash text-xs font-semibold text-accent-strong">
                {person.name.slice(0, 2).toUpperCase()}
              </span>
              <span className="min-w-0">
                <Link href={`/pessoas/${person.employeeId}`} className="block truncate font-medium hover:underline">
                  {person.name}
                </Link>
                <span className="block truncate text-xs text-muted-foreground">{person.email}</span>
              </span>
            </Cell>
            <Cell className="text-muted-foreground">{person.title ?? "—"}</Cell>
            <Cell className="text-muted-foreground">{person.teamName ?? "—"}</Cell>
            <Cell className="flex items-center gap-1.5">
              <StatusPill>{roleLabel(person.userRole)}</StatusPill>
              <StatusPill tone={statusTone(person.userStatus)}>
                {statusLabel(person.userStatus)}
              </StatusPill>
            </Cell>
            <Cell>
              <PersonActions
                employeeId={person.employeeId}
                status={person.userStatus}
                isSelf={person.employeeId === user.employeeId}
              />
            </Cell>
          </ListRow>
        ))}
      </ListCard>
    </div>
  );
}
