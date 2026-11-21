import { redirect } from "next/navigation";

export default async function DevelopmentRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ employee?: string; aba?: string }>;
}) {
  const { employee, aba } = await searchParams;
  const params = new URLSearchParams();
  if (employee) params.set("employee", employee);
  const query = params.toString();
  const path = aba === "pdi" ? "/pdi" : "/evolucao";
  redirect(query ? `${path}?${query}` : path);
}
