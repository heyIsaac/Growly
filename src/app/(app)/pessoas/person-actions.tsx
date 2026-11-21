"use client";

import Link from "next/link";
import { useState } from "react";
import { deletePerson } from "@/lib/actions/mutations";

export function PersonActions({
  employeeId,
  status,
  isSelf,
}: {
  employeeId: string;
  status: string;
  isSelf: boolean;
}) {
  const [open, setOpen] = useState(false);
  const invited = status === "INVITED";

  return (
    <div className="relative flex justify-end">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="rounded-full bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent-wash hover:text-accent-strong"
      >
        Ações
      </button>
      {open ? (
        <div className="absolute top-9 right-0 z-20 w-44 rounded-[1.1rem] bg-white p-1.5 shadow-[var(--shadow-card)] ring-1 ring-border">
          <Link
            href={`/pessoas/${employeeId}`}
            className="block rounded-[0.8rem] px-3 py-2 text-sm hover:bg-card"
            onClick={() => setOpen(false)}
          >
            Editar
          </Link>
          {isSelf ? null : (
            <form
              action={deletePerson}
              onSubmit={(event) => {
                const message = invited
                  ? "Cancelar este convite? A pessoa deixa de aparecer na empresa."
                  : "Excluir esta pessoa? O acesso e o histórico dela saem da empresa.";
                if (!window.confirm(message)) event.preventDefault();
              }}
            >
              <input type="hidden" name="employeeId" value={employeeId} />
              <button
                type="submit"
                className="w-full rounded-[0.8rem] px-3 py-2 text-left text-sm text-destructive hover:bg-card"
              >
                {invited ? "Cancelar convite" : "Excluir usuário"}
              </button>
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
}
