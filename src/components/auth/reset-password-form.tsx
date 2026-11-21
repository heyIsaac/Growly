"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { resetPasswordSchema } from "@/lib/validation/auth";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [error, setError] = useState<string | null>(
    token ? null : "Link inválido ou expirado.",
  );
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    const parsed = resetPasswordSchema.safeParse({
      password: formData.get("password"),
      token,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos.");
      return;
    }

    setPending(true);
    const { error: resetError } = await authClient.resetPassword({
      newPassword: parsed.data.password,
      token: parsed.data.token,
    });
    setPending(false);

    if (resetError) {
      setError(resetError.message ?? "Não foi possível redefinir a senha.");
      return;
    }

    router.push("/sign-in");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(new FormData(event.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nova senha</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Defina uma senha com pelo menos 8 caracteres.
        </p>
      </div>
      {error ? (
        <p className="rounded-2xl bg-accent-wash px-3 py-2 text-sm text-accent-strong">
          {error}
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          disabled={!token}
          className="h-11 rounded-md bg-white"
        />
      </div>
      <Button
        type="submit"
        disabled={pending || !token}
        className="h-11 w-full rounded-md"
      >
        {pending ? "Salvando..." : "Salvar senha"}
      </Button>
      <p className="text-center text-sm">
        <Link href="/sign-in" className="text-muted-foreground">
          Voltar ao login
        </Link>
      </p>
    </form>
  );
}
