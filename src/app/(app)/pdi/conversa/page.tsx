import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { PdiChat } from "../pdi-chat";

export default async function PdiConversationPage() {
  const user = await requireUser();
  if (!user.employeeId) redirect("/pdi");
  return <PdiChat />;
}
