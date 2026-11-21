import { z } from "zod";

export const personSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  userRole: z.enum(["ADMIN", "LEADER", "EMPLOYEE"]),
  teamId: z.string().uuid().optional().or(z.literal("")),
  roleId: z.string().uuid().optional().or(z.literal("")),
  managerId: z.string().uuid().optional().or(z.literal("")),
  area: z.string().optional(),
  seniority: z.string().optional(),
  hiredAt: z.string().optional(),
});

export const teamSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

export const roleSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
});

export const skillSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  category: z.enum(["TECHNICAL", "BEHAVIORAL", "CULTURE"]),
});

export const cycleSchema = z.object({
  name: z.string().min(2),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
});

export const goalSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  skillId: z.string().uuid().optional().or(z.literal("")),
  dueDate: z.string().optional(),
  successIndicator: z.string().optional(),
});
