import { and, asc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  companies,
  employees,
  roles,
  skills,
  teams,
  users,
} from "@/lib/db/schema";

export async function listPeople(companyId: string, search?: string) {
  const term = search?.trim();
  return db
    .select({
      employeeId: employees.id,
      userId: users.id,
      name: users.name,
      email: users.email,
      userRole: users.role,
      userStatus: users.status,
      title: roles.title,
      roleId: roles.id,
      teamName: teams.name,
      teamId: teams.id,
      area: employees.area,
      seniority: employees.seniority,
      hiredAt: employees.hiredAt,
      status: employees.status,
      managerId: employees.managerId,
    })
    .from(employees)
    .innerJoin(users, eq(users.id, employees.userId))
    .leftJoin(roles, eq(roles.id, employees.roleId))
    .leftJoin(teams, eq(teams.id, employees.teamId))
    .where(
      and(
        eq(employees.companyId, companyId),
        term
          ? or(ilike(users.name, `%${term}%`), ilike(users.email, `%${term}%`))
          : undefined,
      ),
    )
    .orderBy(asc(users.name));
}

export async function getPerson(companyId: string, employeeId: string) {
  const rows = await listPeople(companyId);
  return rows.find((row) => row.employeeId === employeeId) ?? null;
}

export async function listTeams(companyId: string) {
  return db
    .select()
    .from(teams)
    .where(eq(teams.companyId, companyId))
    .orderBy(asc(teams.name));
}

export async function listRoles(companyId: string) {
  return db
    .select()
    .from(roles)
    .where(eq(roles.companyId, companyId))
    .orderBy(asc(roles.title));
}

export async function listSkills(companyId: string) {
  return db
    .select()
    .from(skills)
    .where(eq(skills.companyId, companyId))
    .orderBy(asc(skills.name));
}

export async function getCompany(companyId: string) {
  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);
  return company ?? null;
}

export async function listDirectReports(companyId: string, managerEmployeeId: string) {
  return db
    .select({
      employeeId: employees.id,
      name: users.name,
      email: users.email,
      title: roles.title,
      teamName: teams.name,
      status: employees.status,
    })
    .from(employees)
    .innerJoin(users, eq(users.id, employees.userId))
    .leftJoin(roles, eq(roles.id, employees.roleId))
    .leftJoin(teams, eq(teams.id, employees.teamId))
    .where(
      and(
        eq(employees.companyId, companyId),
        eq(employees.managerId, managerEmployeeId),
      ),
    )
    .orderBy(asc(users.name));
}

export async function countPeople(companyId: string) {
  const [row] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(employees)
    .where(eq(employees.companyId, companyId));
  return row?.value ?? 0;
}
