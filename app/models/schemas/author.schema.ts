import { z } from "zod";
import {
  objectIdInstanceSchema,
  urlSchema,
  dateSchema,
} from "./helpers";

/**
 * Schema del objeto user embebido en Author
 */
const embeddedUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Name is required" }),
  avatarUrl: urlSchema.optional().nullable(),
});

/**
 * Schema completo de Author (tal como se almacena en MongoDB)
 */
export const authorSchema = z.object({
  _id: objectIdInstanceSchema,
  user: embeddedUserSchema,
  totalArticles: z.number().int().min(0, { message: "Total articles cannot be negative" }),
  publishedArticles: z.number().int().min(0, { message: "Published articles cannot be negative" }),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

/**
 * Schema para crear un nuevo autor (sin _id ni timestamps, contadores en 0)
 */
export const insertAuthorSchema = z.object({
  user: embeddedUserSchema,
  totalArticles: z.number().int().min(0).default(0),
  publishedArticles: z.number().int().min(0).default(0),
});

/**
 * Schema para actualizar un autor
 * Generalmente solo se actualizan los contadores o datos del user embebido
 */
export const updateAuthorSchema = z.object({
  user: embeddedUserSchema.partial().optional(),
  totalArticles: z.number().int().min(0).optional(),
  publishedArticles: z.number().int().min(0).optional(),
});

/**
 * Schema para incrementar/decrementar contadores de manera atómica
 */
export const updateAuthorCountersSchema = z.object({
  totalArticles: z.number().int(),
  publishedArticles: z.number().int(),
});

// ============================================
// TIPOS DERIVADOS (para usar en TypeScript)
// ============================================
export type AuthorSchema = z.infer<typeof authorSchema>;
export type InsertAuthorSchema = z.infer<typeof insertAuthorSchema>;
export type UpdateAuthorSchema = z.infer<typeof updateAuthorSchema>;
export type UpdateAuthorCountersSchema = z.infer<typeof updateAuthorCountersSchema>;
export type EmbeddedUserSchema = z.infer<typeof embeddedUserSchema>;
