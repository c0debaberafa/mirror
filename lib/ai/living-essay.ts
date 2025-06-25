import { CallSummary } from '@/lib/db/schema';
import { createLivingEssay, getRecentEssays, createTidbits, associateTidbitsWithEssay } from '@/lib/db/living-essay';
import { getUserByClerkId, formatOnboardingArchetypes } from '@/lib/db/client';

interface EssaySection {
  heading: string;
  content: string;
}

interface Tidbit {
  type: string;
  content: string;
  description: string;
  relevanceScore: number;
}

interface GeneratedContent {
  sections: EssaySection[];
  tidbits: Tidbit[];
}

export async function generateFromCallSummary(callSummary: CallSummary): Promise<GeneratedContent> {
  if (!callSummary.clerkUserId) {
    throw new Error('Call summary must have a clerkUserId');
  }

  // Get recent essays for context
  const recentEssays = await getRecentEssays(callSummary.clerkUserId, 3);
  
  // Get user data and archetypes
  const user = await getUserByClerkId(callSummary.clerkUserId);
  const founderArchetypes = user ? formatOnboardingArchetypes(user.metadata) : 'No founder archetype data available.';
  
  // Prepare the prompt with context
  const messages = [{
    role: "system",
    content: `You are generating a "Living Essay" for a startup founder who is thinking aloud to Fred, their AI companion. This isn't a transcript or a diary. It's a dynamic, narrative snapshot of their **founder psychology** — a lightly structured artifact that tracks how they're processing tradeoffs, vision, anxieties, inner momentum, and emergent clarity across time.
  
  This founder uses Fred to catch the thoughts they don't have time to write down. Your job is to turn their spoken reflections into something that helps them return to center, sharpen their thinking, and watch themselves grow.
  
  **Instructions**  
  - Write in second person ("you", "your") to keep it personal.  
  - Maintain the founder's **tone and personality** — grounded, high-agency, thoughtful. Don't sanitize the contradictions.  
  - Identify 1-3 central **themes** running through this reflection. These internal or external tensions, could be moments of clarity, or any strong emotions or insights that the founder is processing.
  - For each section, name the theme and write 1 paragraphs that **follow the founder's thought progression** — include shifts, questions, breakthroughs, and moments of self-doubt. Keep it vivid. Keep it raw.  
  - You may paraphrase for clarity, but keep their original metaphors or phrases when possible.  
  - Always end on an **unfinished** note. This is a living essay, not a wrap-up.
  
  **Add 2-4 "Tidbits"** — short insight tags that act as building blocks for future patterns. Think of these like labeled tiles that Fred can reassemble over time.  
  Each tidbit should have:  
  - A **type** ("Mood", "Focus", "Value", "Tension", "Joy", "Future", "Echo", "Shift")  
  - A 1-2 sentence **content**  
  - A short **description** of why it matters  
  - A relevance score (0-1 float)
  
  **Founder Archetypes & Psychology**
  Use these archetype insights to tailor your response to this founder's specific psychology and communication style:
  
  ${founderArchetypes}
  
  **Founder Context**  
  Here are their recent essay entries (if any):  
  ${recentEssays.map((essay) => 
    (essay.sections as EssaySection[]).map((section) => 
      `${section.heading}:\n${section.content}`
    ).join('\n\n')
  ).join('\n\n---\n\n')}
  
  Recent conversation summary:
  ${callSummary.summary || ''}
  
  Full transcript:
  ${callSummary.transcript || ''}
  
  Output JSON format:
  {
    "sections": [{"heading": string, "content": string}],
    "tidbits": [{
      "type": "Mood"|"Focus"|"Value"|"Tension"|"Joy"|"Future"|"Echo"|"Shift",
      "content": string,
      "description": string,
      "relevanceScore": number
    }]
  }`
  }];

  // Call Groq API
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to generate content from Groq: ${errorData}`);
  }

  const data = await response.json();
  
  if (!data.choices?.[0]?.message?.content) {
    throw new Error('Invalid response format from Groq');
  }

  let content: GeneratedContent;
  try {
    content = JSON.parse(data.choices[0].message.content);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse JSON response from Groq: ${error.message}`);
    }
    throw new Error('Failed to parse JSON response from Groq');
  }

  // Validate the content structure
  if (!content.sections || !Array.isArray(content.sections) || !content.tidbits || !Array.isArray(content.tidbits)) {
    throw new Error('Invalid content structure generated by Groq');
  }

  // Store the essay and get its ID
  const essay = await createLivingEssay(callSummary.clerkUserId, content.sections);

  // Store the tidbits
  const storedTidbits = await createTidbits(callSummary.clerkUserId, content.tidbits);

  // Associate tidbits with the essay
  await associateTidbitsWithEssay(essay.id, storedTidbits.map(t => t.id));

  return content;
} 