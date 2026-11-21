import { redirect } from "next/navigation";
import { Landing } from "@/components/marketing/landing";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  return <Landing />;
}
