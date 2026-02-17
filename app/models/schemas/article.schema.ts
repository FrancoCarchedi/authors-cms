import { z } from "zod";
import {
  objectIdInstanceSchema,
  urlSchema,
  slugSchema,
  dateSchema,
} from "./helpers";

/**
 * Schema del objeto author embebido en Article
 */
const embeddedAuthorSchema = z.object({
  name: z.string().min(1, { message: "Author name is required" }),
  avatarUrl: urlSchema.optional(),
});

/**
 * Schema completo de Article (tal como se almacena en MongoDB)
 */
export const articleSchema = z.object({
  _id: objectIdInstanceSchema,
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(200, { message: "Title is too long (max 200 characters)" })
    .trim(),
  slug: slugSchema,
  text: z
    .string()
    .min(10, { message: "Article text must be at least 10 characters" })
    .max(50000, { message: "Article text is too long (max 50000 characters)" }),
  coverUrl: urlSchema,
  authorId: objectIdInstanceSchema,
  author: embeddedAuthorSchema,
  isPublished: z.boolean(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

/**
 * Schema para crear un nuevo artículo (sin _id ni timestamps)
 * El slug puede ser generado automáticamente desde el título si no se proporciona
 */
export const insertArticleSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(200, { message: "Title is too long (max 200 characters)" })
    .trim(),
  slug: slugSchema.optional(), // Opcional: se puede generar desde title
  text: z
    .string()
    .min(10, { message: "Article text must be at least 10 characters" })
    .max(50000, { message: "Article text is too long (max 50000 characters)" }),
  coverUrl: urlSchema,
  authorId: objectIdInstanceSchema,
  author: embeddedAuthorSchema,
  isPublished: z.boolean().default(false),
});

/**
 * Schema para actualizar un artículo (campos opcionales)
 */
export const updateArticleSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(200, { message: "Title is too long (max 200 characters)" })
    .trim()
    .optional(),
  slug: slugSchema.optional(),
  text: z
    .string()
    .min(10, { message: "Article text must be at least 10 characters" })
    .max(50000, { message: "Article text is too long (max 50000 characters)" })
    .optional(),
  coverUrl: urlSchema.optional(),
  author: embeddedAuthorSchema.partial().optional(), // Permite actualizar parcialmente
  isPublished: z.boolean().optional(),
});

/**
 * Schema para publicar/despublicar un artículo
 */
export const publishArticleSchema = z.object({
  isPublished: z.boolean(),
});

/**
 * Schema para entrada de usuario al crear artículo (sin datos embebidos)
 * Los datos del autor se agregarán internamente desde la sesión
 */
export const createArticleInputSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(200, { message: "Title is too long (max 200 characters)" })
    .trim(),
  text: z
    .string()
    .min(10, { message: "Article text must be at least 10 characters" })
    .max(50000, { message: "Article text is too long (max 50000 characters)" }),
  coverUrl: z.string().url(),
  isPublished: z.boolean().default(false),
});

/**
 * Schema para búsqueda de artículos
 */
export const searchArticlesSchema = z.object({
  query: z.string().min(1).optional(),
  authorId: objectIdInstanceSchema.optional(),
  isPublished: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

// ============================================
// TIPOS DERIVADOS (para usar en TypeScript)
// ============================================

export type ArticleSchema = z.infer<typeof articleSchema>;
export type InsertArticleSchema = z.infer<typeof insertArticleSchema>;
export type UpdateArticleSchema = z.infer<typeof updateArticleSchema>;
export type PublishArticleSchema = z.infer<typeof publishArticleSchema>;
export type CreateArticleInputSchema = z.infer<typeof createArticleInputSchema>;
export type SearchArticlesSchema = z.infer<typeof searchArticlesSchema>;
export type EmbeddedAuthorSchema = z.infer<typeof embeddedAuthorSchema>;
