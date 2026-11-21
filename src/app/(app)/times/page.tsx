import { createRole, createTeam } from "@/lib/actions/mutations";
import { requireRole } from "@/lib/auth/session";
import { listRoles, listTeams } from "@/lib/db/queries/directory";
import { Cell, EmptyRow, ListCard, ListRow, StatusPill } from "@/components/ui/listing";
import { fieldClass, labelClass } from "@/components/ui/field";
import { FormDrawer } from "@/components/ui/form-drawer";
import { TabLinks } from "@/components/ui/tab-links";
import { PageIntro } from "../dashboard/dashboards";

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireRole(["ADMIN"]);
  const { tab } = await searchParams;
  const active = tab === "cargos" ? "cargos" : "times";
  const [teams, roles] = await Promise.all([
    listTeams(user.companyId),
    listRoles(user.companyId),
  ]);

  return (
    <div className="space-y-5">
      <PageIntro
        title={active === "cargos" ? "Cargos" : "Times"}
        kicker={
          active === "cargos"
            ? "Trilhas de cargo da empresa"
            : "Estrutura de times da empresa"
        }
        action={
          active === "cargos" ? (
            <FormDrawer
              label="Novo cargo"
              title="Criar cargo"
              description="O cargo fica disponível no cadastro de pessoas."
              action={createRole}
              submitLabel="Criar cargo"
            >
              <div>
                <label className={labelClass}>Título</label>
                <input name="title" required className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Descrição</label>
                <input name="description" className={fieldClass} />
              </div>
            </FormDrawer>
          ) : (
            <FormDrawer
              label="Novo time"
              title="Criar time"
              description="O time fica disponível no cadastro de pessoas."
              action={createTeam}
              submitLabel="Criar time"
            >
              <div>
                <label className={labelClass}>Nome</label>
                <input name="name" required className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Descrição</label>
                <input name="description" className={fieldClass} />
              </div>
            </FormDrawer>
          )
        }
      />

      <TabLinks
        active={active}
        tabs={[
          { value: "times", label: "Times", href: "/times", count: teams.length },
          { value: "cargos", label: "Cargos", href: "/times?tab=cargos", count: roles.length },
        ]}
      />

      {active === "cargos" ? (
        <ListCard columns={["Cargo", "Descrição", "Status"]}>
          {roles.length === 0 ? <EmptyRow>Nenhum cargo criado.</EmptyRow> : null}
          {roles.map((role) => (
            <ListRow key={role.id}>
              <Cell className="font-medium">{role.title}</Cell>
              <Cell className="text-muted-foreground">{role.description ?? "—"}</Cell>
              <Cell>
                <StatusPill tone="success">Ativo</StatusPill>
              </Cell>
            </ListRow>
          ))}
        </ListCard>
      ) : (
        <ListCard columns={["Time", "Descrição"]}>
          {teams.length === 0 ? <EmptyRow>Nenhum time criado.</EmptyRow> : null}
          {teams.map((team) => (
            <ListRow key={team.id}>
              <Cell className="font-medium">{team.name}</Cell>
              <Cell className="text-muted-foreground">{team.description ?? "—"}</Cell>
            </ListRow>
          ))}
        </ListCard>
      )}
    </div>
  );
}
