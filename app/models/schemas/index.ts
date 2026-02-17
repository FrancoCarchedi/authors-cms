/**
 * Exportación centralizada de todos los schemas Zod
 * 
 * Uso:
 * import { userSchema, insertUserSchema, ... } from '@/app/models/schemas'
 */

// ============================================
// HELPERS & VALIDATORS
// ============================================
export * from "./helpers";

// ============================================
// USER SCHEMAS
// ============================================
export {
  userSchema,
  updateUserSchema,
  type UserSchema,
  type UpdateUserSchema,
} from "./user.schema";

// ============================================
// AUTHOR SCHEMAS
// ============================================
export {
  authorSchema,
  insertAuthorSchema,
  updateAuthorSchema,
  updateAuthorCountersSchema,
  type AuthorSchema,
  type InsertAuthorSchema,
  type UpdateAuthorSchema,
  type UpdateAuthorCountersSchema,
  type EmbeddedUserSchema,
} from "./author.schema";

// ============================================
// ARTICLE SCHEMAS
// ============================================
export {
  articleSchema,
  insertArticleSchema,
  updateArticleSchema,
  publishArticleSchema,
  createArticleInputSchema,
  searchArticlesSchema,
  type ArticleSchema,
  type InsertArticleSchema,
  type UpdateArticleSchema,
  type PublishArticleSchema,
  type CreateArticleInputSchema,
  type SearchArticlesSchema,
  type EmbeddedAuthorSchema,
} from "./article.schema";
