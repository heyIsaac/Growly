import { z } from "zod";

export const emailSchema = z.string().email("Informe um e-mail válido.");

export const passwordSchema = z
  .string()
  .min(8, "A senha precisa ter pelo menos 8 caracteres.");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Informe a senha."),
});

export const firstAccessSchema = z.object({
  name: z.string().min(2, "Informe seu nome."),
  email: emailSchema,
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  token: z.string().min(1, "Token inválido."),
});
