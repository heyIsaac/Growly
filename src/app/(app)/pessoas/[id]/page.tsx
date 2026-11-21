import { notFound } from "next/navigation";
import { setPersonActive, updatePerson } from "@/lib/actions/mutations";
import { requireRole } from "@/lib/auth/session";
import { getPerson, listPeople, listRoles, listTeams } from "@/lib/db/queries/directory";
import { fieldClass, ghostButtonClass, labelClass, primaryButtonClass } from "@/components/ui/field";
import { CardHead, Chip, SoftCard } from "@/components/ui/surface";
import { PageIntro } from "../../dashboard/dashboards";

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole(["ADMIN"]);
  const { id } = await params;
  const [person, people, teams, roles] = await Promise.all([
    getPerson(user.companyId, id),
    listPeople(user.companyId),
    listTeams(user.companyId),
    listRoles(user.companyId),
  ]);
  if (!person) notFound();

  return (
    <div className="space-y-5">
      <PageIntro
        title={person.name}
        kicker={person.email}
        action={
          <div className="flex items-center gap-2">
            <Chip tone={person.status === "ACTIVE" ? "dark" : "muted"}>{person.status === "ACTIVE" ? "Ativo" : person.status === "INACTIVE" ? "Inativo" : "Convite"}</Chip>
            <form action={setPersonActive}>
              <input type="hidden" name="employeeId" value={person.employeeId} />
              <input type="hidden" name="active" value={person.status === "ACTIVE" ? "false" : "true"} />
              <button className={ghostButtonClass}>
                {person.status === "ACTIVE" ? "Desativar" : "Ativar"}
              </button>
            </form>
          </div>
        }
      />

      <SoftCard>
        <CardHead title="Dados profissionais" hint="Campos administrados pelo RH" />
        <form action={updatePerson} className="grid gap-3 md:grid-cols-2">
          <input type="hidden" name="employeeId" value={person.employeeId} />
          <div>
            <label className={labelClass}>Nome</label>
            <input name="name" defaultValue={person.name} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>E-mail</label>
            <input name="email" defaultValue={person.email} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Papel no app</label>
            <select name="userRole" defaultValue={person.userRole} className={fieldClass}>
              <option value="EMPLOYEE">Colaborador</option>
              <option value="LEADER">Líder</option>
              <option value="ADMIN">RH / Admin</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Time</label>
            <select name="teamId" defaultValue={person.teamId ?? ""} className={fieldClass}>
              <option value="">Sem time</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Cargo</label>
            <select name="roleId" defaultValue={person.roleId ?? ""} className={fieldClass}>
              <option value="">Sem cargo</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Gestor</label>
            <select name="managerId" defaultValue={person.managerId ?? ""} className={fieldClass}>
              <option value="">Sem gestor</option>
              {people
                .filter((item) => item.employeeId !== person.employeeId)
                .map((item) => (
                  <option key={item.employeeId} value={item.employeeId}>{item.name}</option>
                ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Área</label>
            <input name="area" defaultValue={person.area ?? ""} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Senioridade</label>
            <input name="seniority" defaultValue={person.seniority ?? ""} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Admissão</label>
            <input name="hiredAt" type="date" defaultValue={person.hiredAt ?? ""} className={fieldClass} />
          </div>
          <div className="flex items-end">
            <button className={primaryButtonClass}>Salvar alterações</button>
          </div>
        </form>
      </SoftCard>
    </div>
  );
}
