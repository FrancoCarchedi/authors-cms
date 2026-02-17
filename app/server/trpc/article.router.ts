import { router, protectedProcedure } from "./init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { articlesCol } from "@/app/models/collections/articles.collection";
import { authorsCol } from "@/app/models/collections/authors.collection";
import { generateSlugFromTitle } from "@/lib/slug.utils";
import type { Article } from "@/app/models/interfaces/article.interface";

// ─── Helpers ────────────────────────────────────────────

async function getAuthorByUserId(userId: string) {
  const col = await authorsCol();
  const author = await col.findOne({ "user.id": userId });
  if (!author) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Author profile not found. Please create one first.",
    });
  }
  return author;
}

// ─── Router ─────────────────────────────────────────────

export const articleRouter = router({
  /** Paginated list of articles for the logged-in author */
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(50).default(10),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const author = await getAuthorByUserId(ctx.user.id);
      const col = await articlesCol();

      const filter: Record<string, unknown> = {
        authorId: author._id,
      };

      if (input.search) {
        filter.$text = { $search: input.search };
      }

      // When using $text search, sort by text score first, then by date
      const sort = input.search
        ? { score: { $meta: "textScore" as const }, createdAt: -1 as const }
        : { createdAt: -1 as const };

      const [data, total] = await Promise.all([
        col
          .find(filter)
          .sort(sort)
          .skip((input.page - 1) * input.pageSize)
          .limit(input.pageSize)
          .toArray(),
        col.countDocuments(filter),
      ]);

      const totalPages = Math.max(1, Math.ceil(total / input.pageSize));

      return {
        data: data.map(serializeArticle),
        total,
        page: input.page,
        pageSize: input.pageSize,
        totalPages,
      };
    }),

  /** Get a single article by slug (must belong to logged-in author) */
  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const author = await getAuthorByUserId(ctx.user.id);
      const col = await articlesCol();

      const article = await col.findOne({
        slug: input.slug,
        authorId: author._id,
      });

      if (!article) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" });
      }

      return serializeArticle(article);
    }),

  /** Create a new article */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3).max(200).trim(),
        text: z.string().min(10).max(50000),
        coverUrl: z.string().url(),
        isPublished: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const author = await getAuthorByUserId(ctx.user.id);
      const col = await articlesCol();

      const slug = await generateSlugFromTitle(input.title, async (s) => {
        const existing = await col.findOne({ slug: s });
        return !!existing;
      });

      const now = new Date();
      const doc = {
        title: input.title,
        slug,
        text: input.text,
        coverUrl: input.coverUrl,
        authorId: author._id,
        author: {
          name: author.user.name,
          avatarUrl: author.user.avatarUrl ?? undefined,
        },
        isPublished: input.isPublished,
        createdAt: now,
        updatedAt: now,
      } as Article;

      await col.insertOne(doc);

      // Update author counters
      const authorCol = await authorsCol();
      const inc: Record<string, number> = { totalArticles: 1 };
      if (input.isPublished) inc.publishedArticles = 1;
      await authorCol.updateOne({ _id: author._id }, { $inc: inc, $set: { updatedAt: now } });

      return { slug };
    }),

  /** Update an existing article */
  update: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
        title: z.string().min(3).max(200).trim().optional(),
        text: z.string().min(10).max(50000).optional(),
        coverUrl: z.string().url().optional(),
        isPublished: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const author = await getAuthorByUserId(ctx.user.id);
      const col = await articlesCol();

      const existing = await col.findOne({
        slug: input.slug,
        authorId: author._id,
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" });
      }

      const now = new Date();
      const $set: Record<string, unknown> = { updatedAt: now };

      if (input.title !== undefined) {
        $set.title = input.title;
        // Regenerate slug if title changed
        const newSlug = await generateSlugFromTitle(input.title, async (s) => {
          if (s === existing.slug) return false; // same slug is fine
          const dup = await col.findOne({ slug: s });
          return !!dup;
        });
        $set.slug = newSlug;
      }

      if (input.text !== undefined) $set.text = input.text;
      if (input.coverUrl !== undefined) $set.coverUrl = input.coverUrl;
      if (input.isPublished !== undefined) $set.isPublished = input.isPublished;

      await col.updateOne({ _id: existing._id }, { $set });

      // Update publishedArticles counter if isPublished changed
      if (input.isPublished !== undefined && input.isPublished !== existing.isPublished) {
        const authorCol = await authorsCol();
        const delta = input.isPublished ? 1 : -1;
        await authorCol.updateOne(
          { _id: author._id },
          { $inc: { publishedArticles: delta }, $set: { updatedAt: now } },
        );
      }

      const newSlug = ($set.slug as string) ?? existing.slug;
      return { slug: newSlug };
    }),

  /** Delete an article */
  delete: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const author = await getAuthorByUserId(ctx.user.id);
      const col = await articlesCol();

      const article = await col.findOne({
        slug: input.slug,
        authorId: author._id,
      });

      if (!article) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" });
      }

      await col.deleteOne({ _id: article._id });

      // Update author counters
      const authorCol = await authorsCol();
      const dec: Record<string, number> = { totalArticles: -1 };
      if (article.isPublished) dec.publishedArticles = -1;
      await authorCol.updateOne(
        { _id: author._id },
        { $inc: dec, $set: { updatedAt: new Date() } },
      );

      return { success: true };
    }),
});

// ─── Serialization ──────────────────────────────────────

function serializeArticle(article: Article) {
  return {
    id: article._id.toHexString(),
    title: article.title,
    slug: article.slug,
    text: article.text,
    coverUrl: article.coverUrl,
    authorId: article.authorId.toHexString(),
    author: article.author,
    isPublished: article.isPublished,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  };
}
