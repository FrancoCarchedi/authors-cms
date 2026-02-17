import { ObjectId } from "mongodb";

export interface Author {
  _id: ObjectId;
  user: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  totalArticles: number;
  publishedArticles: number;
  createdAt: Date;
  updatedAt: Date;
}