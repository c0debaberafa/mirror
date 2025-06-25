import { db } from './index';
import { users, callSummaries } from './schema';
import { eq, desc } from 'drizzle-orm';
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

// Get the 3 most recent call summaries for a user
export async function getRecentCallSummaries(clerkUserId: string, limit: number = 3): Promise<{ id: string; summary: string | null; createdAt: Date }[]> {
  return await db.select({
    id: callSummaries.id,
    summary: callSummaries.summary,
    createdAt: callSummaries.createdAt
  })
    .from(callSummaries)
    .where(eq(callSummaries.clerkUserId, clerkUserId))
    .orderBy(desc(callSummaries.createdAt))
    .limit(limit);
}

// Format onboarding archetypes from user metadata
export function formatOnboardingArchetypes(metadata: Record<string, unknown> | null): string {
  if (!metadata || typeof metadata !== 'object') {
    return 'No onboarding data available.';
  }

  // Handle nested public_metadata structure from Clerk
  const onboardingData = (metadata.public_metadata || metadata) as Record<string, unknown>;
  
  if (!onboardingData || typeof onboardingData !== 'object') {
    return 'No onboarding data available.';
  }

  const archetypes = [];
  
  // Dream home archetype
  if (onboardingData.dream_home_archetype) {
    const dreamHomeMap: Record<string, string> = {
      'penthouse_manhattan': 'Status-driven operator who responds well to themes of mastery, visibility, and power dynamics',
      'seaside_villa': 'Reflection-seeking achiever who craves clarity, beauty, balance and likes metaphors of depth and pacing',
      'family_home': 'Legacy builder who values groundedness, relational success and resonates with "durability," "meaning," "people-first"',
      'nomadic': 'Freedom-maximizer who wants optionality, hates rigidity and likes emergent strategy, async patterns, non-linearity',
      'nature_retreat': 'Essentialist who craves focus, purity, quiet power and likes language about distillation, signal vs. noise',
      'no_home_system': 'Systems thinker who sees life as recursive loops, not destinations and prefers abstraction, pattern language'
    };
    
    const originalTerm = onboardingData.dream_home_archetype as string;
    const description = dreamHomeMap[originalTerm] || originalTerm;
    archetypes.push(`🔹 Dream Home: "${originalTerm}" - ${description}`);
  }

  // Calendar style
  if (onboardingData.calendar_style) {
    const calendarMap: Record<string, string> = {
      'back_to_back': 'Speed operator with high energy who wants fast loops and likes action words, forward motion',
      'fully_blocked': 'Focus purist who protects cognitive space and responds well to language about clarity, signal, sovereignty',
      'rhythmic': 'Pattern-based thinker who works in cycles and resonates with seasonal metaphors, iteration, ritual',
      'wide_open': 'Intuition-led person who hates rigidity and prefers creative prompts, non-linear exploration',
      'light_and_reactive': 'Connector who values responsiveness and likes prompts about sensing, dynamics, improvisation',
      'still_figuring_out': 'Wandering mode who wants to feel seen without pressure and needs gentle direction, not rigid systems'
    };
    
    const originalTerm = onboardingData.calendar_style as string;
    const description = calendarMap[originalTerm] || originalTerm;
    archetypes.push(`🔹 Calendar Style: "${originalTerm}" - ${description}`);
  }

  // Spirit animal archetype
  if (onboardingData.spirit_animal_archetype) {
    const spiritAnimalMap: Record<string, string> = {
      'fox': 'Tactical strategist who enjoys complexity, edge, pattern-breaking and likes sharp metaphors, subtle wins',
      'horse': 'Momentum engine who craves speed, rhythm, output and likes tracking movement, progress, and friction points',
      'whale': 'Deep thinker who moves slow but big and responds to language about scale, influence, quiet power',
      'parrot': 'Charismatic communicator who is story-led, relationship-centric and likes prompts that touch voice, persuasion, vibe',
      'dragon': 'Vision-led founder who craves transformation and resonates with fire, intensity, and seeing around corners',
      'still_becoming': 'Undefined/Searching person who needs space for ambiguity and responds well to gentle questions, emergence'
    };
    
    const originalTerm = onboardingData.spirit_animal_archetype as string;
    const description = spiritAnimalMap[originalTerm] || originalTerm;
    archetypes.push(`🔹 Spirit Animal: "${originalTerm}" - ${description}`);
  }

  // Peak moment trigger
  if (onboardingData.peak_moment_trigger) {
    const peakMomentMap: Record<string, string> = {
      'starting_unbelieved': 'Contrarian builder who craves underdog energy, gets lit up by first steps and likes prompts about risk, tension, raw belief',
      'cracking_problem': 'Systems solver who gets dopamine from breakthroughs and likes logic chains, debugging patterns, structured thinking',
      'pitching_room_shift': 'Performer-visionary who loves the emotional high of being seen and resonates with feedback loops, stakes, presence',
      'changed_how_they_think': 'Impact believer who wants depth over scale and likes prompts about meaning, worldview shifts, why-it-matters',
      'flow_edge_of_chaos': 'Chaos surfer who thrives in the void and resonates with duality, adrenaline, constraint-as-catalyst',
      'haven_t_found_it': 'Explorer who is still mapping what matters and needs reflective, identity-oriented prompts'
    };
    
    const originalTerm = onboardingData.peak_moment_trigger as string;
    const description = peakMomentMap[originalTerm] || originalTerm;
    archetypes.push(`🔹 Peak Moment: "${originalTerm}" - ${description}`);
  }

  if (archetypes.length === 0) {
    return 'No onboarding archetypes found in user metadata.';
  }

  return archetypes.join('\n\n');
}

// Get user data with onboarding archetypes and recent call summaries
export async function getUserDataForVoiceChat(clerkUserId: string) {
  const user = await getUserByClerkId(clerkUserId);
  if (!user) {
    return {
      firstName: null,
      lastName: null,
      onboardingArchetypes: 'No user data available.',
      callSummaries: []
    };
  }

  const onboardingArchetypes = formatOnboardingArchetypes(user.metadata as Record<string, unknown>);
  const callSummaries = await getRecentCallSummaries(clerkUserId, 3);

  return {
    firstName: user.firstName,
    lastName: user.lastName,
    onboardingArchetypes,
    callSummaries
  };
}

// Export the db instance for direct use when needed
export { db }; 