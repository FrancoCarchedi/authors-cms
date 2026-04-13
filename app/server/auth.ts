import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { betterAuth } from "better-auth";
import { getDb } from '@/lib/db';
import { authorsCol } from '@/app/models/collections/authors.collection';
import type { Author } from '@/app/models/interfaces/author.interface';

const db = await getDb();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      prompt: "select_account", 
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    modelName: "users",
    fields: {
      image: "avatarUrl",
    },
  },
  session: {
    modelName: "sessions",
  },
  account: {
    modelName: "accounts",
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const col = await authorsCol();
          const now = new Date();
          await col.insertOne({
            user: {
              id: user.id,
              name: user.name,
              avatarUrl: (user as unknown as { image?: string | null }).image ?? null,
            },
            totalArticles: 0,
            publishedArticles: 0,
            createdAt: now,
            updatedAt: now,
          } as Author);
        },
      },
    },
  },
});
