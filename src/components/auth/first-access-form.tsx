"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { firstAccessSchema } from "@/lib/validation/auth";

export function FirstAccessForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    const parsed = firstAccessSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos.");
      return;
    }

    setPending(true);
    try {
      const { error: signUpError } = await authClient.signUp.email({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (signUpError) {
        setError(signUpError.message ?? "Não foi possível criar o acesso.");
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar o acesso.");
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
        <h1 className="text-2xl font-semibold tracking-tight">Primeiro acesso</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Defina sua senha. Cargo, área e gestor já foram definidos pelo RH.
        </p>
      </div>
      {error ? (
        <p className="rounded-2xl bg-accent-wash px-3 py-2 text-sm text-accent-strong">
          {error}
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" required className="h-11 rounded-md bg-white" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail corporativo</Label>
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
      <Button type="submit" disabled={pending} className="h-11 w-full rounded-md">
        {pending ? "Criando acesso..." : "Ativar conta"}
      </Button>
      <p className="text-center text-sm">
        <Link href="/sign-in" className="text-muted-foreground">
          Já tenho senha
        </Link>
      </p>
    </form>
  );
}
