import { router, protectedProcedure } from "./init";
import { z } from "zod";
import { authorsCol } from "@/app/models/collections/authors.collection";
import type { Author } from "@/app/models/interfaces/author.interface";

export const authorRouter = router({
  /** Create an author profile for a newly registered user */
  create: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        name: z.string(),
        avatarUrl: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const col = await authorsCol();
      const now = new Date();
      const result = await col.insertOne({
        user: {
          id: input.userId,
          name: input.name,
          avatarUrl: input.avatarUrl ?? null,
        },
        totalArticles: 0,
        publishedArticles: 0,
        createdAt: now,
        updatedAt: now,
      } as Author);
      return { authorId: result.insertedId.toHexString() };
    }),

  /** Paginated list of all authors with optional name search */
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(50).default(5),
        search: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const col = await authorsCol();

      const filter: Record<string, unknown> = {};

      if (input.search) {
        filter["user.name"] = { $regex: input.search, $options: "i" };
      }

      const [data, total] = await Promise.all([
        col
          .find(filter)
          .sort({ "user.name": 1 })
          .skip((input.page - 1) * input.pageSize)
          .limit(input.pageSize)
          .toArray(),
        col.countDocuments(filter),
      ]);

      const totalPages = Math.max(1, Math.ceil(total / input.pageSize));

      return {
        data: data.map(serializeAuthor),
        total,
        page: input.page,
        pageSize: input.pageSize,
        totalPages,
      };
    }),
});

function serializeAuthor(author: Author) {
  return {
    id: author._id.toHexString(),
    name: author.user.name,
    avatarUrl: author.user.avatarUrl ?? null,
    totalArticles: author.totalArticles,
    publishedArticles: author.publishedArticles,
  };
}
