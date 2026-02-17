import { router, publicProcedure, protectedProcedure } from "./init";
import { articleRouter } from "./article.router";
import { authorRouter } from "./author.router";
import { profileRouter } from "./profile.router";

export const appRouter = router({
  ping: publicProcedure.query(() => "pong"),
  me: protectedProcedure.query(({ ctx }) => ctx.user),

  article: articleRouter,
  author: authorRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
