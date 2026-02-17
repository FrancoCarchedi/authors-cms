import { getDb } from "@/lib/db";
import type { Collection, Document } from "mongodb";
import type { User } from "../interfaces/user.interface";

/**
 * Better Auth manages this collection directly.
 * Use this helper only for custom queries beyond auth operations.
 */
export const usersCol = async (): Promise<Collection<Document & User>> => {
  const db = await getDb();
  return db.collection("users");
};