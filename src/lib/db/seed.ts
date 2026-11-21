import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { companies, employees, roles, teams, users } from "./schema";
import { enrichGrowlyDemo } from "./seed-demo";

config({ path: ".env.local" });

const url = process.env.DATABASE_URL_UNPOOLED;
if (!url) {
  throw new Error("DATABASE_URL_UNPOOLED is not set.");
}

async function seedCompany(params: {
  db: ReturnType<typeof drizzle>;
  name: string;
  slug: string;
  admin: { name: string; email: string };
  roleTitle: string;
  teamName: string;
  area: string;
  seniority: string;
}) {
  const existing = await params.db
    .select()
    .from(companies)
    .where(eq(companies.slug, params.slug))
    .limit(1);

  if (existing[0]) {
    console.log(`Company ${params.slug} already exists.`);
    return existing[0];
  }

  const [company] = await params.db
    .insert(companies)
    .values({ name: params.name, slug: params.slug })
    .returning();

  const [role] = await params.db
    .insert(roles)
    .values({
      companyId: company.id,
      title: params.roleTitle,
      description: "Cargo inicial criado pelo seed.",
    })
    .returning();

  const [team] = await params.db
    .insert(teams)
    .values({
      companyId: company.id,
      name: params.teamName,
      description: "Time inicial criado pelo seed.",
    })
    .returning();

  const [user] = await params.db
    .insert(users)
    .values({
      companyId: company.id,
      email: params.admin.email,
      name: params.admin.name,
      role: "ADMIN",
      status: "INVITED",
    })
    .returning();

  await params.db.insert(employees).values({
    companyId: company.id,
    userId: user.id,
    teamId: team.id,
    roleId: role.id,
    area: params.area,
    seniority: params.seniority,
    hiredAt: "2024-01-15",
    status: "ACTIVE",
  });

  console.log(`Seeded ${params.slug} (${params.admin.email}).`);
  return company;
}

async function main() {
  const pool = new Pool({ connectionString: url });
  const db = drizzle(pool);

  try {
    const growly = await seedCompany({
      db,
      name: "Growly Demo",
      slug: "growly-demo",
      admin: { name: "Ana Ribeiro", email: "admin@growly.dev" },
      roleTitle: "People Partner",
      teamName: "People",
      area: "RH",
      seniority: "Sênior",
    });
    await enrichGrowlyDemo(db, growly.id);

    await seedCompany({
      db,
      name: "Acme",
      slug: "acme",
      admin: { name: "Bruno Costa", email: "other@acme.dev" },
      roleTitle: "Head of People",
      teamName: "People Ops",
      area: "RH",
      seniority: "Sênior",
    });
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
