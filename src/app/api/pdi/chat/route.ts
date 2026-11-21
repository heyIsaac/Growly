import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  tool,
  type UIMessage,
} from "ai";
import { getCurrentUser } from "@/lib/auth/session";
import { buildPdiBrief } from "@/lib/ai/pdi-brief";
import { pdiProposalSchema } from "@/lib/ai/pdi-proposal";

export const maxDuration = 60;

const KICKOFF = "Quero montar um objetivo de PDI a partir do meu maior gap.";

function messageText(message: UIMessage) {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join(" ")
    .trim();
}

function isVague(text: string) {
  const normalized = text
    .trim()
    .toLowerCase()
    .replace(/[.!?…]+$/g, "")
    .replace(/\s+/g, " ");
  return /^(sim|ok|okay|pode|pode ser|pode sim|tá|ta|aham|uhum|claro|isso|isso mesmo|beleza|fechado|certo|tanto faz|por mim|manda|vai|vamos|quero|pode montar)$/.test(
    normalized,
  );
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.employeeId) {
    return Response.json({ error: "Entre para montar o PDI." }, { status: 401 });
  }
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "A conversa ainda não está configurada." }, { status: 503 });
  }

  const body = (await req.json()) as { messages?: UIMessage[] };
  const messages = Array.isArray(body.messages) ? body.messages.slice(-16) : [];
  const brief = await buildPdiBrief(user.companyId, user.employeeId, user.name);
  const replies = messages
    .filter((message) => message.role === "user")
    .map(messageText)
    .filter((text) => text && text !== KICKOFF);
  const lastReply = replies.at(-1) ?? "";
  const substantive = replies.filter((text) => !isVague(text)).length;
  const ready = substantive >= 3 && !isVague(lastReply);

  const result = streamText({
    model: openai("gpt-5.4-mini"),
    instructions: [
      "Você conversa com um colaborador para montar um único objetivo de PDI.",
      "Fale em português, em uma ou duas frases, e faça só uma pergunta por vez.",
      "Não invente notas. Use apenas o briefing.",
      "Um sim, um ok ou um 'pode ser' não responde a pergunta. Nesse caso, reformule ou peça um exemplo concreto.",
      "Antes de propor, a pessoa precisa ter dito, com as próprias palavras: o resultado que quer, uma situação real do dia a dia, e como vai saber que chegou lá.",
      ready
        ? "Se esses três pontos já apareceram, chame proporObjetivo e diga em uma frase que é um rascunho e que ela pode ajustar. Se ainda faltar um, pergunte só esse."
        : "Ainda é cedo para propor. Não chame proporObjetivo. Faça a próxima pergunta que ainda não foi respondida.",
      "Se ela já viu uma proposta e pedir mudança, converse o ajuste e só então chame proporObjetivo de novo.",
      "O skillId precisa ser um id da lista. Monte de 2 a 4 ações curtas, ligadas ao que ela contou.",
      brief,
    ].join("\n"),
    messages: await convertToModelMessages(messages),
    toolChoice: ready ? "auto" : "none",
    tools: {
      proporObjetivo: tool({
        description: "Mostra o objetivo proposto para a pessoa confirmar antes de salvar. Só use depois de uma conversa de verdade.",
        inputSchema: pdiProposalSchema,
      }),
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
