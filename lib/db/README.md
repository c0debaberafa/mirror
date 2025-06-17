# Database Setup with Drizzle ORM

This project uses Drizzle ORM for database operations with Supabase PostgreSQL.

## Setup

### Environment Variables

Add these to your `.env.local`:

```bash
SUPABASE_DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
```

You can get this URL from your Supabase project dashboard under Settings > Database.

### Database Operations

#### Generate Migrations
```bash
npm run db:generate
```

#### Push Schema Changes (Development)
```bash
npm run db:push
```

#### Run Migrations (Production)
```bash
npm run db:migrate
```

#### Open Drizzle Studio (Database GUI)
```bash
npm run db:studio
```

## Usage

### Basic Database Operations

```typescript
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Query users
const allUsers = await db.select().from(users);

// Find user by Clerk ID
const user = await db.select().from(users).where(eq(users.clerkUserId, 'clerk_123'));

// Insert user
const newUser = await db.insert(users).values({
  clerkUserId: 'clerk_123',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe'
}).returning();

// Update user
await db.update(users)
  .set({ firstName: 'Jane' })
  .where(eq(users.clerkUserId, 'clerk_123'));
```

### Using Helper Functions

```typescript
import { 
  getUserByClerkId, 
  createUser, 
  updateUser, 
  deleteUser 
} from '@/lib/db/client';

// Get user
const user = await getUserByClerkId('clerk_123');

// Create user
const newUser = await createUser({
  clerkUserId: 'clerk_123',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe'
});

// Update user
await updateUser('clerk_123', { firstName: 'Jane' });

// Soft delete user
await deleteUser('clerk_123');
```

## Schema

### Users Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `clerk_user_id` | TEXT | Unique Clerk user ID |
| `email` | TEXT | User's email address |
| `first_name` | TEXT | User's first name |
| `last_name` | TEXT | User's last name |
| `image_url` | TEXT | User's profile image URL |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Record last update time |
| `last_sign_in_at` | TIMESTAMP | Last sign-in time |
| `is_active` | BOOLEAN | User active status |
| `metadata` | JSONB | Additional user data |

## TypeScript Types

The schema automatically generates TypeScript types:

```typescript
import type { User, NewUser } from '@/lib/db/schema';

// User type (for reading from database)
const user: User = {
  id: 'uuid',
  clerkUserId: 'clerk_123',
  email: 'user@example.com',
  // ... other fields
};

// NewUser type (for inserting into database)
const newUser: NewUser = {
  clerkUserId: 'clerk_123',
  email: 'user@example.com',
  // ... other fields (id and timestamps are optional)
};
```

## Migration Workflow

1. **Development**: Use `npm run db:push` to sync schema changes
2. **Production**: Use `npm run db:generate` to create migration files, then `npm run db:migrate` to apply them

## Benefits of Drizzle ORM

- ✅ **Type Safety**: Compile-time query validation
- ✅ **Performance**: Lightweight and fast
- ✅ **Developer Experience**: Excellent IntelliSense
- ✅ **Migrations**: Version-controlled schema changes
- ✅ **Supabase Compatible**: Works seamlessly with Supabase PostgreSQL 