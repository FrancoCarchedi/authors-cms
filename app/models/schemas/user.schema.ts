import { z } from "zod";
import {
  emailSchema,
  urlSchema,
  dateSchema,
} from "./helpers";

/**
 * Schema completo de User (unificado con Better Auth).
 * Better Auth maneja: id, email, emailVerified, createdAt, updatedAt.
 * Campos mapeados: image → avatarUrl.
 * Password es gestionado por Better Auth en la colección "accounts".
 */
export const userSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name is too long" })
    .trim(),
  email: emailSchema,
  emailVerified: z.boolean(),
  avatarUrl: urlSchema.optional().nullable(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

/**
 * Schema para actualizar un usuario (campos editables por el propio usuario)
 */
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name is too long" })
    .trim()
    .optional(),
  avatarUrl: urlSchema.optional().nullable(),
});

// ============================================
// TIPOS DERIVADOS (para usar en TypeScript)
// ============================================
export type UserSchema = z.infer<typeof userSchema>;
export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
