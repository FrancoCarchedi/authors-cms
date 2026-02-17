import { ObjectId } from "mongodb";

export interface Article {
  _id: ObjectId;
  title: string;
  slug: string;
  text: string;
  coverUrl: string;
  authorId: ObjectId;
  author: {
    name: string;
    avatarUrl?: string;
  };
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}