import { setViewAs } from "@/lib/actions/preview";
import { getAuthenticatedUser, requireUser } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/authz/roles";
import { listPreviewPersonas } from "@/lib/db/queries/users";
import { CardHead, Chip, SoftCard } from "@/components/ui/surface";
import { PageIntro } from "../dashboard/dashboards";

function formatHiredAt(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-[1.2rem] bg-white px-4 py-3.5">
      <p className="text-xs text-ink-subtle">{label}</p>
      <p className="mt-1 text-sm font-medium">{value || "Não informado"}</p>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default async function ProfilePage() {
  const [user, real] = await Promise.all([requireUser(), getAuthenticatedUser()]);
  const personas = real?.role === "ADMIN" ? await listPreviewPersonas(real.companyId) : [];

  return (
    <div className="space-y-5">
      <PageIntro title="Meu perfil" kicker={user.companyName} />

      <SoftCard>
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex size-20 items-center justify-center rounded-full bg-accent-wash text-2xl font-semibold text-accent-strong">
            {initials(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[1.7rem] leading-tight font-semibold tracking-tight">{user.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip tone="dark">{ROLE_LABELS[user.role]}</Chip>
              {user.title ? <Chip tone="white">{user.title}</Chip> : null}
              {user.teamName ? <Chip tone="muted">{user.teamName}</Chip> : null}
            </div>
          </div>
        </div>
      </SoftCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <SoftCard>
          <CardHead
            title="Onde você atua"
            hint="Cargo, área, time e gestor são definidos pelo RH. Para mudar, fale com o People."
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Cargo" value={user.title} />
            <Field label="Área" value={user.area} />
            <Field label="Time" value={user.teamName} />
            <Field label="Gestor" value={user.managerName} />
          </div>
        </SoftCard>
        <SoftCard>
          <CardHead
            title="Trajetória"
            hint="Senioridade e desde quando você está na empresa."
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Senioridade" value={user.seniority} />
            <Field label="Na empresa desde" value={user.hiredAt ? formatHiredAt(user.hiredAt) : null} />
          </div>
        </SoftCard>
      </div>

      {personas.length > 0 ? (
        <SoftCard>
          <CardHead
            title="Visualizar como"
            hint="Troca só as telas. Você continua autenticado como administrador."
          />
          <div className="grid gap-2 md:grid-cols-3">
            {personas.map((persona) => {
              const active = persona.id === user.id;
              return (
                <form key={persona.id} action={setViewAs}>
                  <input type="hidden" name="userId" value={persona.id} />
                  <button
                    className={`w-full rounded-[1.2rem] px-4 py-3.5 text-left transition-colors ${
                      active ? "bg-primary text-dark" : "bg-white hover:bg-accent-wash"
                    }`}
                  >
                    <span className="block text-xs">{ROLE_LABELS[persona.role]}</span>
                    <span className="mt-1 block text-sm font-medium">{persona.name}</span>
                    <span className={`mt-1 block text-xs ${active ? "text-dark/60" : "text-muted-foreground"}`}>
                      {active ? "Visão atual" : persona.email}
                    </span>
                  </button>
                </form>
              );
            })}
          </div>
        </SoftCard>
      ) : null}
    </div>
  );
}
