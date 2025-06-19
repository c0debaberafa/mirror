import { pgTable, text, timestamp, boolean, jsonb, uuid, integer, doublePrecision } from 'drizzle-orm/pg-core';

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

// Living Essay Schema
export const tidbits = pgTable('tidbits', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: text('type').notNull(), // 'Mood' | 'Focus' | 'Value' | 'Tension' | 'Joy' | 'Future' | 'Echo' | 'Shift'
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastUsedAt: timestamp('last_used_at').defaultNow().notNull(),
  relevanceScore: doublePrecision('relevance_score').notNull(),
});

export const livingEssays = pgTable('living_essays', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  version: integer('version').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  sections: jsonb('sections').notNull(), // EssaySection[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  previousVersionId: uuid('previous_version_id').references((): any => livingEssays.id),
  delta: jsonb('delta'), // Optional delta information
});

export const essayTidbits = pgTable('essay_tidbits', {
  id: uuid('id').defaultRandom().primaryKey(),
  essayId: uuid('essay_id').references(() => livingEssays.id).notNull(),
  tidbitId: uuid('tidbit_id').references(() => tidbits.id).notNull(),
  position: integer('position').notNull(),
});

// Export types for use in your application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type CallSummary = typeof callSummaries.$inferSelect;
export type NewCallSummary = typeof callSummaries.$inferInsert;
export type Tidbit = typeof tidbits.$inferSelect;
export type NewTidbit = typeof tidbits.$inferInsert;
export type LivingEssay = typeof livingEssays.$inferSelect;
export type NewLivingEssay = typeof livingEssays.$inferInsert;
export type EssayTidbit = typeof essayTidbits.$inferSelect;
export type NewEssayTidbit = typeof essayTidbits.$inferInsert;

// Types for the JSON fields
export interface EssaySection {
  id: string;
  heading: string;
  content: string;
  changes?: {
    addedText: string[];
    removedText: string[];
  };
}

export interface EssayDelta {
  addedSections: string[];
  modifiedSections: string[];
  removedSections: string[];
  addedTidbits: string[];
  removedTidbits: string[];
} 