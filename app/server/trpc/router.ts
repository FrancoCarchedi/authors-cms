import { router, publicProcedure, protectedProcedure } from "./init";
import { authorsCol } from "@/app/models/collections/authors.collection";
import { articleRouter } from "./article.router";
import { authorRouter } from "./author.router";
import { profileRouter } from "./profile.router";
import type { Author } from "@/app/models/interfaces/author.interface";
import { z } from "zod";

export const appRouter = router({
  ping: publicProcedure.query(() => "pong"),
  me: protectedProcedure.query(({ ctx }) => ctx.user),

  createAuthor: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        name: z.string(),
        avatarUrl: z.string().nullable().optional(),
      })
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

  article: articleRouter,
  author: authorRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
