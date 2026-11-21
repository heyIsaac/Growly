import { requireUser } from "@/lib/auth/session";
import { listEvaluations, openSelfEvaluation } from "@/lib/db/queries/evaluations";
import { EvaluationsBoard } from "./evaluations-board";

export default async function MyEvaluationsPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string }>;
}) {
  const user = await requireUser();
  const { aba } = await searchParams;
  const tab = aba === "recebidas" ? "recebidas" : "auto";
  const evaluations = user.employeeId
    ? (await listEvaluations(user.companyId)).filter((item) => item.employeeId === user.employeeId)
    : [];
  const selfEvals = evaluations.filter((item) => item.type === "SELF");
  const openSelf =
    user.employeeId && !selfEvals.some((item) => item.status === "SUBMITTED")
      ? await openSelfEvaluation(user.companyId, user.employeeId)
      : null;

  return (
    <EvaluationsBoard
      tab={tab}
      selfEvals={selfEvals}
      receivedEvals={evaluations.filter((item) => item.type === "LEADER")}
      selfStart={openSelf}
      basePath="/avaliacoes"
      title="Minhas avaliações"
      selfKicker="O que você registrou sobre si"
      receivedKicker="O que o líder registrou sobre você"
      showPerson={false}
    />
  );
}
