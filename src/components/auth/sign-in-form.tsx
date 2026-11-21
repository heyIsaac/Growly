"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { signInSchema } from "@/lib/validation/auth";

const errorCopy: Record<string, string> = {
  not_invited: "Este e-mail não foi convidado. Peça o cadastro ao RH.",
  inactive: "Sua conta está inativa. Fale com o RH.",
  already_bound: "Esta conta já está vinculada a outro acesso.",
};

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(searchParams.get("error"));
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    const parsed = signInSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos.");
      return;
    }

    setPending(true);
    try {
      const { error: signInError } = await authClient.signIn.email({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (signInError) {
        setError(signInError.message ?? "Não foi possível entrar.");
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
      return;
    } finally {
      setPending(false);
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(new FormData(event.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Use o e-mail corporativo cadastrado pelo RH.
        </p>
      </div>
      {error ? (
        <p className="rounded-2xl bg-accent-wash px-3 py-2 text-sm text-accent-strong">
          {errorCopy[error] ?? error}
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
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          className="h-11 rounded-md bg-white"
        />
      </div>
      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-md"
      >
        {pending ? "Entrando..." : "Entrar"}
      </Button>
      <div className="flex flex-col gap-2 text-center text-sm">
        <Link href="/forgot-password" className="text-accent-strong">
          Recuperar senha
        </Link>
        <Link href="/first-access" className="text-muted-foreground">
          Primeiro acesso
        </Link>
        <Link href="/" className="text-muted-foreground">
          Sua empresa ainda não usa? Contratar o Growly
        </Link>
      </div>
    </form>
  );
}
