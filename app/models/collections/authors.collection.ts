import { getDb } from "@/lib/db";
import type { Collection } from "mongodb";
import type { Author } from "../interfaces/author.interface";

export type InsertAuthor = Omit<Author, "_id">;

export const authorsCol = async (): Promise<Collection<Author>> => {
  const db = await getDb();
  return db.collection<Author>("authors");
};