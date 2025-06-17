import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create the connection
const connectionString = process.env.SUPABASE_DATABASE_URL!;

if (!connectionString) {
  throw new Error('Missing SUPABASE_DATABASE_URL environment variable');
}

// Create postgres client
const client = postgres(connectionString);

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export schema for convenience
export * from './schema'; 