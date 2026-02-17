import { getDb } from "@/lib/db";
import { Collection } from "mongodb";
import { Article } from "../interfaces/article.interface";

export const articlesCol = async (): Promise<Collection<Article>> => {
  const db = await getDb();
  return db.collection<Article>("articles");
};