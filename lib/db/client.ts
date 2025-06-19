import { db } from './index';
import { users, callSummaries } from './schema';
import { eq } from 'drizzle-orm';
import type { User, NewUser, CallSummary, NewCallSummary } from './schema';

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

export async function upsertUser(clerkUserId: string, userData: Partial<NewUser>): Promise<User> {
  // First try to update the existing user
  const existingUser = await updateUser(clerkUserId, userData);
  
  if (existingUser) {
    return existingUser;
  }
  
  // If user doesn't exist, create a new one
  const newUserData: NewUser = {
    clerkUserId,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    imageUrl: userData.imageUrl,
    createdAt: userData.createdAt || new Date(),
    metadata: userData.metadata,
  };
  
  return await createUser(newUserData);
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

// Call Summary operations
export async function createCallSummary(callData: NewCallSummary): Promise<CallSummary> {
  const result = await db.insert(callSummaries).values(callData).returning();
  return result[0];
}

export async function getCallSummaryByCallId(callId: string): Promise<CallSummary | null> {
  const result = await db.select().from(callSummaries).where(eq(callSummaries.callId, callId)).limit(1);
  return result[0] || null;
}

export async function getCallSummariesByUserId(userId: string): Promise<CallSummary[]> {
  return await db.select().from(callSummaries).where(eq(callSummaries.userId, userId));
}

export async function getCallSummariesByClerkUserId(clerkUserId: string): Promise<CallSummary[]> {
  return await db.select().from(callSummaries).where(eq(callSummaries.clerkUserId, clerkUserId));
}

// Export the db instance for direct use when needed
export { db }; 