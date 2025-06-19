import { db } from './index';
import { livingEssays, tidbits, essayTidbits, users } from './schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { diffChars } from 'diff';

export interface EssaySection {
  heading: string;
  content: string;
}

export interface EssayDelta {
  added: string[];
  removed: string[];
  modified: {
    before: string;
    after: string;
  }[];
}

async function getUserIdByClerkId(clerkId: string): Promise<string | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, clerkId),
  });
  return user?.id || null;
}

export async function createLivingEssay(clerkUserId: string, sections: EssaySection[]) {
  const userId = await getUserIdByClerkId(clerkUserId);
  if (!userId) throw new Error('User not found');

  // Get the latest version number for this user
  const latestEssay = await db.query.livingEssays.findFirst({
    where: eq(livingEssays.userId, userId),
    orderBy: [desc(livingEssays.version)],
  });

  const version = (latestEssay?.version ?? 0) + 1;
  
  // Calculate delta if there's a previous version
  let delta: EssayDelta | undefined;
  if (latestEssay) {
    delta = {
      added: [],
      removed: [],
      modified: [],
    };

    // Compare each section with the previous version
    for (const newSection of sections) {
      const oldSection = (latestEssay.sections as EssaySection[]).find(
        (s) => s.heading === newSection.heading
      );

      if (!oldSection) {
        // New section added
        delta.added.push(newSection.content);
      } else {
        // Compare content using diff
        const contentDiff = diffChars(oldSection.content, newSection.content);
        let hasChanges = false;

        for (const part of contentDiff) {
          if (part.added) {
            delta.added.push(part.value);
            hasChanges = true;
          } else if (part.removed) {
            delta.removed.push(part.value);
            hasChanges = true;
          }
        }

        if (hasChanges) {
          delta.modified.push({
            before: oldSection.content,
            after: newSection.content,
          });
        }
      }
    }

    // Check for removed sections
    for (const oldSection of (latestEssay.sections as EssaySection[])) {
      const newSection = sections.find(
        (s) => s.heading === oldSection.heading
      );
      if (!newSection) {
        delta.removed.push(oldSection.content);
      }
    }
  }

  // Create new essay version
  const result = await db.insert(livingEssays).values({
    userId,
    version,
    sections,
    previousVersionId: latestEssay?.id,
    delta,
  }).returning();

  return result[0];
}

export async function getRecentEssays(clerkUserId: string, limit: number = 5) {
  const userId = await getUserIdByClerkId(clerkUserId);
  if (!userId) return [];

  return await db.query.livingEssays.findMany({
    where: eq(livingEssays.userId, userId),
    orderBy: [desc(livingEssays.createdAt)],
    limit,
  });
}

export async function getEssayById(id: string) {
  const result = await db.select()
    .from(livingEssays)
    .where(eq(livingEssays.id, id))
    .limit(1);
  return result[0];
}

export async function getEssayByVersion(clerkUserId: string, version: number) {
  const userId = await getUserIdByClerkId(clerkUserId);
  if (!userId) return null;

  const result = await db.select()
    .from(livingEssays)
    .where(and(
      eq(livingEssays.userId, userId),
      eq(livingEssays.version, version)
    ))
    .limit(1);
  return result[0];
}

interface Tidbit {
  type: string;
  content: string;
  description: string;
  relevanceScore: number;
}

export async function createTidbits(clerkUserId: string, newTidbits: Tidbit[]) {
  const userId = await getUserIdByClerkId(clerkUserId);
  if (!userId) throw new Error('User not found');

  const result = await db.insert(tidbits).values(
    newTidbits.map(tidbit => ({
      userId,
      type: tidbit.type,
      content: tidbit.content,
      relevanceScore: tidbit.relevanceScore,
    }))
  ).returning();

  return result;
}

export async function getRelevantTidbits(clerkUserId: string, limit = 4) {
  const userId = await getUserIdByClerkId(clerkUserId);
  if (!userId) return [];

  // Get tidbits with highest relevance scores
  return await db.select()
    .from(tidbits)
    .where(eq(tidbits.userId, userId))
    .orderBy(desc(tidbits.relevanceScore))
    .limit(limit);
}

export async function updateTidbitRelevance(tidbitId: string, relevanceScore: number) {
  await db.update(tidbits)
    .set({ 
      relevanceScore,
      lastUsedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(tidbits.id, tidbitId));
}

export async function associateTidbitsWithEssay(essayId: string, tidbitIds: string[]) {
  // First, remove any existing associations
  await db.delete(essayTidbits)
    .where(eq(essayTidbits.essayId, essayId));

  // Then create new associations with positions
  await db.insert(essayTidbits).values(
    tidbitIds.map((tidbitId, index) => ({
      essayId,
      tidbitId,
      position: index,
    }))
  );
} 