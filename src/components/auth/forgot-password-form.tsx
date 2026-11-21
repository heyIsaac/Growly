"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { forgotPasswordSchema } from "@/lib/validation/auth";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    const parsed = forgotPasswordSchema.safeParse({
      email: formData.get("email"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos.");
      return;
    }

    setPending(true);
    const { error: resetError } = await authClient.requestPasswordReset({
      email: parsed.data.email,
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setPending(false);

    if (resetError) {
      setError(resetError.message ?? "Não foi possível enviar o e-mail.");
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">E-mail enviado</h1>
        <p className="text-sm text-muted-foreground">
          Se o e-mail estiver cadastrado, você recebe o link para redefinir a senha.
        </p>
        <Link href="/sign-in" className="text-sm text-accent-strong">
          Voltar ao login
        </Link>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(new FormData(event.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Recuperar senha</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enviaremos um link para o e-mail corporativo.
        </p>
      </div>
      {error ? (
        <p className="rounded-2xl bg-accent-wash px-3 py-2 text-sm text-accent-strong">
          {error}
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          className="h-11 rounded-md bg-white"
        />
      </div>
      <Button type="submit" disabled={pending} className="h-11 w-full rounded-md">
        {pending ? "Enviando..." : "Enviar link"}
      </Button>
      <p className="text-center text-sm">
        <Link href="/sign-in" className="text-muted-foreground">
          Voltar ao login
        </Link>
      </p>
    </form>
  );
}
