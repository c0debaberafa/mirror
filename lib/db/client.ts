import { db } from './index';
import { users } from './schema';
import { eq } from 'drizzle-orm';
import type { User, NewUser } from './schema';

// User operations
export async function getUserByClerkId(clerkUserId: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId)).limit(1);
  return result[0] || null;
}

export async function createUser(userData: NewUser): Promise<User> {
  const result = await db.insert(users).values(userData).returning();
  return result[0];
}

export async function updateUser(clerkUserId: string, userData: Partial<NewUser>): Promise<User | null> {
  const result = await db.update(users)
    .set({ ...userData, updatedAt: new Date() })
    .where(eq(users.clerkUserId, clerkUserId))
    .returning();
  return result[0] || null;
}

export async function deleteUser(clerkUserId: string): Promise<User | null> {
  const result = await db.update(users)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(users.clerkUserId, clerkUserId))
    .returning();
  return result[0] || null;
}

export async function updateLastSignIn(clerkUserId: string): Promise<User | null> {
  const result = await db.update(users)
    .set({ lastSignInAt: new Date(), updatedAt: new Date() })
    .where(eq(users.clerkUserId, clerkUserId))
    .returning();
  return result[0] || null;
}

// Export the db instance for direct use when needed
export { db }; 