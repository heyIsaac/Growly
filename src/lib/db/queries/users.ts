import { and, asc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/lib/db";
import { companies, employees, roles, teams, users } from "@/lib/db/schema";
import { USER_ROLES, type UserRole } from "@/lib/authz/roles";

const PREVIEW_EMAILS: Record<UserRole, string> = {
  ADMIN: "admin@growly.dev",
  LEADER: "lider@growly.dev",
  EMPLOYEE: "colab@growly.dev",
};

export type SessionUser = {
  id: string;
  companyId: string;
  companyName: string;
  employeeId: string | null;
  authUserId: string | null;
  email: string;
  name: string;
  role: UserRole;
  status: "INVITED" | "ACTIVE" | "INACTIVE";
  title: string | null;
  teamName: string | null;
  area: string | null;
  seniority: string | null;
  hiredAt: string | null;
  avatarUrl: string | null;
  managerName: string | null;
};

const managerEmployees = alias(employees, "manager_employees");
const managerUsers = alias(users, "manager_users");

function mapRow(row: {
  user: typeof users.$inferSelect;
  company: typeof companies.$inferSelect;
  employee: typeof employees.$inferSelect | null;
  role: typeof roles.$inferSelect | null;
  team: typeof teams.$inferSelect | null;
  manager: typeof users.$inferSelect | null;
}): SessionUser {
  return {
    id: row.user.id,
    companyId: row.user.companyId,
    companyName: row.company.name,
    employeeId: row.employee?.id ?? null,
    authUserId: row.user.authUserId,
    email: row.user.email,
    name: row.user.name,
    role: row.user.role,
    status: row.user.status,
    title: row.role?.title ?? null,
    teamName: row.team?.name ?? null,
    area: row.employee?.area ?? null,
    seniority: row.employee?.seniority ?? null,
    hiredAt: row.employee?.hiredAt ?? null,
    avatarUrl: row.employee?.avatarUrl ?? null,
    managerName: row.manager?.name ?? null,
  };
}

function sessionQuery() {
  return db
    .select({
      user: users,
      company: companies,
      employee: employees,
      role: roles,
      team: teams,
      manager: managerUsers,
    })
    .from(users)
    .innerJoin(companies, eq(companies.id, users.companyId))
    .leftJoin(employees, eq(employees.userId, users.id))
    .leftJoin(roles, eq(roles.id, employees.roleId))
    .leftJoin(teams, eq(teams.id, employees.teamId))
    .leftJoin(managerEmployees, eq(managerEmployees.id, employees.managerId))
    .leftJoin(managerUsers, eq(managerUsers.id, managerEmployees.userId));
}

export async function findSessionUserByAuthId(authUserId: string) {
  const rows = await sessionQuery()
    .where(eq(users.authUserId, authUserId))
    .limit(1);
  const row = rows[0];
  return row ? mapRow(row) : null;
}

export async function findSessionUserById(userId: string) {
  const rows = await sessionQuery().where(eq(users.id, userId)).limit(1);
  const row = rows[0];
  return row ? mapRow(row) : null;
}

export async function listPreviewPersonas(companyId: string) {
  const rows = await sessionQuery()
    .where(eq(users.companyId, companyId))
    .orderBy(asc(users.name));
  const people = rows.map(mapRow).filter((person) => person.status !== "INACTIVE");

  return USER_ROLES.flatMap((role) => {
    const matches = people.filter((person) => person.role === role);
    const picked =
      matches.find((person) => person.email === PREVIEW_EMAILS[role]) ?? matches[0];
    return picked ? [picked] : [];
  });
}

export async function findUserByEmail(email: string) {
  const rows = await sessionQuery()
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  const row = rows[0];
  return row ? mapRow(row) : null;
}

export async function bindAuthUser(params: {
  userId: string;
  companyId: string;
  authUserId: string;
}) {
  const [updated] = await db
    .update(users)
    .set({
      authUserId: params.authUserId,
      status: "ACTIVE",
      updatedAt: new Date(),
    })
    .where(
      and(eq(users.id, params.userId), eq(users.companyId, params.companyId)),
    )
    .returning();

  return updated ?? null;
}
