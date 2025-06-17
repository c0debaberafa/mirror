// DEPRECATED: This file is kept for backward compatibility
// Use the new Drizzle ORM setup in lib/db/ instead

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_PROJECT_URL!;
const supabaseKey = process.env.SUPABASE_API_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Re-export Drizzle types for backward compatibility
export type { User, NewUser } from './db/schema';

// Legacy interface - use Drizzle types instead
export interface LegacyUser {
  id: string;
  clerk_user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
  is_active: boolean;
  metadata: Record<string, unknown>;
} 