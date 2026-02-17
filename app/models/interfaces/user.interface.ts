/**
 * User interface — unified with Better Auth.
 * Better Auth maps: image → avatarUrl.
 * Password is stored in the "accounts" collection by Better Auth.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  avatarUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}