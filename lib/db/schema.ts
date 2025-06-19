import { pgTable, text, timestamp, boolean, jsonb, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkUserId: text('clerk_user_id').notNull().unique(),
  email: text('email'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastSignInAt: timestamp('last_sign_in_at'),
  isActive: boolean('is_active').default(true).notNull(),
  metadata: jsonb('metadata'),
});

export const callSummaries = pgTable('call_summaries', {
  id: uuid('id').defaultRandom().primaryKey(),
  callId: text('call_id').notNull().unique(), // VAPI call ID to prevent duplicates
  userId: uuid('user_id').references(() => users.id), // Optional user association
  clerkUserId: text('clerk_user_id'), // Optional Clerk user ID for easier queries
  summary: text('summary'),
  transcript: text('transcript'),
  messages: jsonb('messages'), // Store the full messages array as JSON
  endedReason: text('ended_reason'),
  recordingUrl: text('recording_url'),
  assistantId: text('assistant_id'),
  callData: jsonb('call_data'), // Store the full call object as JSON
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Export types for use in your application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type CallSummary = typeof callSummaries.$inferSelect;
export type NewCallSummary = typeof callSummaries.$inferInsert; 