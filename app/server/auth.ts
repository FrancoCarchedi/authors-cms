import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { betterAuth } from "better-auth";
import { getDb } from '@/lib/db';

const db = await getDb();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
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
});
