import { z } from "zod";
import { emailSchema } from "./auth";

export const quoteSchema = z.object({
  plan: z.enum(["ESSENTIAL", "GROWTH", "SCALE"]),
  seats: z.coerce.number().int().min(1, "Informe a quantidade de pessoas.").max(5000),
  name: z.string().trim().min(2, "Informe seu nome."),
  companyName: z.string().trim().min(2, "Informe o nome da empresa."),
  email: emailSchema,
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().max(1000).optional(),
});

export type QuoteInput = z.input<typeof quoteSchema>;
