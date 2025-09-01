import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const processSchema = z.object({
  title: z.string().min(1),
  name: z.string().optional(),
  rounds: z.array(z.any()).optional(),
  status: z.enum(["draft", "published"]).default("draft"),
});
