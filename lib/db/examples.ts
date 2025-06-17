// Example usage patterns for Drizzle ORM

import { db } from './index';
import { users } from './schema';
import { eq, desc, asc } from 'drizzle-orm';
import { 
  getUserByClerkId, 
  updateUser 
} from './client';

// Example 1: Get current user data
export async function getCurrentUserData(clerkUserId: string) {
  try {
    const user = await getUserByClerkId(clerkUserId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

// Example 2: Get all active users
export async function getAllActiveUsers() {
  try {
    const activeUsers = await db
      .select()
      .from(users)
      .where(eq(users.isActive, true))
      .orderBy(desc(users.createdAt));
    
    return activeUsers;
  } catch (error) {
    console.error('Error fetching active users:', error);
    throw error;
  }
}

// Example 3: Search users by name
export async function searchUsersByName(searchTerm: string) {
  try {
    const searchResults = await db
      .select()
      .from(users)
      .where(
        // This would need a more sophisticated search implementation
        // For now, just a simple example
        eq(users.isActive, true)
      )
      .orderBy(asc(users.firstName));
    
    // Filter by search term (in a real app, you'd use ILIKE or full-text search)
    return searchResults.filter(user => 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
}

// Example 4: Update user profile
export async function updateUserProfile(
  clerkUserId: string, 
  updates: { firstName?: string; lastName?: string; imageUrl?: string }
) {
  try {
    const updatedUser = await updateUser(clerkUserId, updates);
    if (!updatedUser) {
      throw new Error('User not found');
    }
    return updatedUser;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Example 5: Get user statistics
export async function getUserStats() {
  try {
    const totalUsers = await db.select({ count: users.id }).from(users);
    const activeUsers = await db
      .select({ count: users.id })
      .from(users)
      .where(eq(users.isActive, true));
    
    return {
      total: totalUsers.length,
      active: activeUsers.length,
      inactive: totalUsers.length - activeUsers.length
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
}

// Example 6: Batch operations
export async function updateMultipleUsers(updates: Array<{ clerkUserId: string; updates: Record<string, unknown> }>) {
  try {
    const results = await Promise.all(
      updates.map(({ clerkUserId, updates }) => 
        updateUser(clerkUserId, updates)
      )
    );
    
    return results.filter(Boolean);
  } catch (error) {
    console.error('Error updating multiple users:', error);
    throw error;
  }
} 