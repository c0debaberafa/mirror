This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Database Setup

This project uses **Drizzle ORM** with **Supabase PostgreSQL** for database operations.

### Environment Variables

Add these to your `.env.local`:

```bash
SUPABASE_PROJECT_URL=your_supabase_project_url
SUPABASE_API_KEY=your_supabase_api_key
SUPABASE_DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
CLERK_SIGNING_SECRET=your_clerk_signing_secret
```

### Database Operations

```bash
# Generate migrations
npm run db:generate

# Push schema changes (development)
npm run db:push

# Run migrations (production)
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio
```

For detailed database documentation, see [`lib/db/README.md`](lib/db/README.md).

## Voice Assistant (VAPI)

This project includes integration with [VAPI](https://vapi.ai) for real-time voice conversations with AI assistants.

### VAPI Setup

1. **Get VAPI Credentials**: Sign up at [vapi.ai](https://vapi.ai) and get your API key and assistant ID
2. **Configure Environment Variables**: Add to your `.env.local`:
   ```bash
   NEXT_PUBLIC_VAPI_API_KEY=your_public_api_key_here
   NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_assistant_id_here
   ```
3. **Usage**: The voice widget will appear on the main page and at `/vapi-demo`

For detailed VAPI setup instructions, see [`VAPI_SETUP.md`](VAPI_SETUP.md).

## Features

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **Supabase** for PostgreSQL database
- **Clerk** for authentication
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **VAPI Voice Assistant** for real-time voice conversations

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
