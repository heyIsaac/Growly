"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowLeft, CornerDownLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { saveProposedGoal } from "@/lib/actions/mutations";
import { pdiProposalSchema, type PdiProposal } from "@/lib/ai/pdi-proposal";

const KICKOFF = "Quero montar um objetivo de PDI a partir do meu maior gap.";

export function PdiChat() {
  const router = useRouter();
  const started = useRef(false);
  const threadEnd = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/pdi/chat" }),
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (started.current) return;
      started.current = true;
      void sendMessage({ text: KICKOFF });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [sendMessage]);

  const draft = latestProposal(messages);
  const busy = status === "submitted" || status === "streaming" || saving;

  useEffect(() => {
    threadEnd.current?.scrollIntoView({ block: "end" });
  }, [messages, status, draft]);

  async function save(proposal: PdiProposal) {
    setSaving(true);
    setSaveError(null);
    const result = await saveProposedGoal(proposal);
    setSaving(false);
    if (!result.ok) {
      setSaveError(result.error);
      return;
    }
    router.push("/pdi");
    router.refresh();
  }

  return (
    <div className="-mb-12 flex h-[calc(100dvh-5.5rem)] flex-col overflow-hidden">
      <div className="flex items-center gap-3 pb-4">
        <Link
          href="/pdi"
          aria-label="Voltar ao PDI"
          className="inline-flex size-10 items-center justify-center rounded-full bg-white text-foreground ring-1 ring-border transition-colors hover:bg-card"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-[1.6rem] leading-tight font-semibold tracking-tight">Montar objetivo</h1>
      </div>

      <div className="relative min-h-0 flex-1">
        <div className="h-full overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-full flex-col gap-3 px-0.5 pt-4 pb-28">
          {messages.map((message) =>
            message.parts.map((part, index) => {
              if (part.type === "text" && part.text && part.text !== KICKOFF) {
                const repeated = message.parts.some(
                  (other, otherIndex) =>
                    otherIndex < index && other.type === "text" && other.text === part.text,
                );
                if (repeated) return null;
                const mine = message.role === "user";
                return (
                  <div key={`${message.id}-${index}`} className={mine ? "flex justify-end" : "flex justify-start"}>
                    <p
                      className={
                        mine
                          ? "max-w-[80%] rounded-[1.35rem] rounded-br-md bg-primary px-4 py-2.5 text-sm leading-relaxed text-dark"
                          : "max-w-[80%] rounded-[1.35rem] rounded-bl-md bg-[#e4e1da] px-4 py-2.5 text-sm leading-relaxed text-foreground"
                      }
                    >
                      <MessageText text={part.text} />
                    </p>
                  </div>
                );
              }
              if (part.type === "tool-proporObjetivo" && part.state === "input-streaming") {
                return (
                  <div key={`${message.id}-${index}`} className="flex justify-start">
                  <p className="rounded-[1.35rem] rounded-bl-md bg-[#e4e1da] px-4 py-2.5 text-sm text-muted-foreground">
                    Montando o objetivo…
                  </p>
                  </div>
                );
              }
              return null;
            }),
          )}
          {status === "submitted" ? (
            <div className="flex justify-start">
              <p className="rounded-[1.35rem] rounded-bl-md bg-[#e4e1da] px-4 py-2.5 text-sm text-muted-foreground">
                Pensando…
              </p>
            </div>
          ) : null}
          {error ? (
            <div className="flex justify-start">
              <p className="rounded-[1.35rem] rounded-bl-md bg-[#e4e1da] px-4 py-2.5 text-sm text-destructive">
                Não consegui continuar a conversa. Tente de novo.
              </p>
            </div>
          ) : null}
          {draft ? (
            <div className="flex justify-start">
              <div className="w-full max-w-[80%] rounded-[1.35rem] rounded-bl-md bg-[#e4e1da] p-4">
                <p className="text-xs font-semibold tracking-[0.14em] text-ink-subtle uppercase">Proposta</p>
                <p className="mt-1.5 text-base font-semibold">{draft.title}</p>
                {draft.description ? (
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{draft.description}</p>
                ) : null}
                <p className="mt-3 text-sm">Como saber que chegou lá. {draft.successIndicator}</p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                  {draft.actions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
                {saveError ? <p className="mt-2 text-sm text-destructive">{saveError}</p> : null}
                <button
                  type="button"
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-dark transition-all hover:bg-primary-hover active:translate-y-px"
                  disabled={busy}
                  onClick={() => void save(draft)}
                >
                  {saving ? "Salvando…" : "Salvar no meu PDI"}
                </button>
              </div>
            </div>
          ) : null}
          <div ref={threadEnd} />
        </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-shell to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-shell to-transparent" />
      </div>

      <form
        className="fixed inset-x-0 bottom-0 z-30 bg-shell px-4 pt-3 pb-5 md:left-[256px] md:px-6 lg:px-8"
        onSubmit={(event) => {
          event.preventDefault();
          const text = input.trim();
          if (!text || busy) return;
          setInput("");
          void sendMessage({ text });
        }}
      >
        <div className="flex h-16 items-center rounded-full bg-white pr-2 pl-6 shadow-[0_8px_30px_rgb(20_19_17/0.06)]">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={draft ? "Quer ajustar a proposta?" : "Escreva aqui a sua resposta"}
            className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            disabled={busy}
          />
          <button
            type="submit"
            aria-label="Enviar"
            className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-dark text-white transition-colors hover:bg-foreground disabled:opacity-40"
            disabled={busy || !input.trim()}
          >
            <CornerDownLeft className="size-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

function MessageText({ text }: { text: string }) {
  const pieces = text.split(/(\*\*[^*]+\*\*)/g);
  return pieces.map((piece, index) => {
    if (piece.startsWith("**") && piece.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold">
          {piece.slice(2, -2)}
        </strong>
      );
    }
    return piece;
  });
}

function latestProposal(messages: { parts: ReadonlyArray<{ type: string; state?: string; input?: unknown }> }[]) {
  let proposal: PdiProposal | null = null;
  for (const message of messages) {
    for (const part of message.parts) {
      if (part.type !== "tool-proporObjetivo" || part.state !== "input-available") continue;
      const parsed = pdiProposalSchema.safeParse(part.input);
      if (parsed.success) proposal = parsed.data;
    }
  }
  return proposal;
}
