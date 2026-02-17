import { router, protectedProcedure } from "./init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { usersCol } from "@/app/models/collections/users.collection";
import { authorsCol } from "@/app/models/collections/authors.collection";
import { articlesCol } from "@/app/models/collections/articles.collection";

export const profileRouter = router({
  /** Get the current user's profile */
  get: protectedProcedure.query(async ({ ctx }) => {
    const col = await usersCol();
    const user = await col.findOne({ _id: new ObjectId(ctx.user.id) });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return {
      id: ctx.user.id,
      name: user.name,
      email: user.email,
      avatarUrl: (user.avatarUrl as string | null | undefined) ?? null,
      createdAt:
        user.createdAt instanceof Date
          ? user.createdAt.toISOString()
          : String(user.createdAt),
    };
  }),

  /** Update the current user's name and/or avatar */
  update: protectedProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(2, "El nombre debe tener al menos 2 caracteres")
          .max(100, "El nombre es demasiado largo")
          .trim()
          .optional(),
        avatarUrl: z.string().url().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date();

      // ── 1. Build the $set for the users collection ──────
      const userSet: Record<string, unknown> = { updatedAt: now };
      if (input.name !== undefined) userSet.name = input.name;
      if (input.avatarUrl !== undefined) userSet.avatarUrl = input.avatarUrl;

      const users = await usersCol();
      const result = await users.updateOne(
        { _id: new ObjectId(ctx.user.id) },
        { $set: userSet },
      );

      if (result.matchedCount === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // ── 2. Sync embedded author data ────────────────────
      const authorSet: Record<string, unknown> = { updatedAt: now };
      if (input.name !== undefined) authorSet["user.name"] = input.name;
      if (input.avatarUrl !== undefined)
        authorSet["user.avatarUrl"] = input.avatarUrl;

      const authors = await authorsCol();
      await authors.updateOne({ "user.id": ctx.user.id }, { $set: authorSet });

      // ── 3. Sync embedded author in articles ─────────────
      if (input.name !== undefined || input.avatarUrl !== undefined) {
        const articleSet: Record<string, unknown> = {};
        if (input.name !== undefined) articleSet["author.name"] = input.name;
        if (input.avatarUrl !== undefined)
          articleSet["author.avatarUrl"] = input.avatarUrl;

        const articles = await articlesCol();
        const author = await authors.findOne({ "user.id": ctx.user.id });
        if (author) {
          await articles.updateMany(
            { authorId: author._id },
            { $set: articleSet },
          );
        }
      }

      return { success: true };
    }),
});
