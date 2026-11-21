import { z } from "zod";

export const pdiProposalSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional().default(""),
  skillId: z.string().uuid(),
  successIndicator: z.string().trim().min(2).max(240),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  actions: z.array(z.string().trim().min(2).max(160)).min(2).max(4),
});

export type PdiProposal = z.infer<typeof pdiProposalSchema>;
