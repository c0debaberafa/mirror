import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create the connection
const connectionString = process.env.SUPABASE_DATABASE_URL!;

if (!connectionString) {
  throw new Error('Missing SUPABASE_DATABASE_URL environment variable');
}

// Create postgres client with SSL and connection settings
const client = postgres(connectionString, {
  ssl: 'require',
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export schema for convenience
export * from './schema'; 