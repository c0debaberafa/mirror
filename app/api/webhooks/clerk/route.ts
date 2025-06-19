import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { createUser, deleteUser, updateLastSignIn, upsertUser } from '@/lib/db/client';

// Types for Clerk webhook data
interface ClerkUser {
  id: string;
  email_addresses?: Array<{
    id: string;
    email_address: string;
  }>;
  primary_email_address_id?: string;
  first_name?: string;
  last_name?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface ClerkSession {
  user_id: string;
}

interface ClerkWebhookEvent {
  data: ClerkUser | ClerkSession;
  type: string;
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_SIGNING_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_SIGNING_SECRET from Clerk Dashboard to .env');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.text();
  const body = JSON.parse(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: ClerkWebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Get the ID and type
  const { id } = evt.data as ClerkUser;
  const eventType = evt.type;

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
  console.log('Webhook body:', body);

  // Handle the webhook
  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt.data as ClerkUser);
        break;
      case 'user.updated':
        await handleUserUpdated(evt.data as ClerkUser);
        break;
      case 'user.deleted':
        await handleUserDeleted(evt.data as ClerkUser);
        break;
      case 'session.created':
        await handleSessionCreated(evt.data as ClerkSession);
        break;
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }
  } catch (error) {
    console.error('Error handling webhook:', error);
    return new Response('Error processing webhook', {
      status: 500
    });
  }

  return new Response('Webhook processed successfully', { status: 200 });
}

async function handleUserCreated(userData: ClerkUser) {
  const { id, email_addresses, first_name, last_name, image_url, created_at } = userData;
  
  const primaryEmail = email_addresses?.find((email) => email.id === userData.primary_email_address_id)?.email_address;

  try {
    await createUser({
      clerkUserId: id,
      email: primaryEmail,
      firstName: first_name,
      lastName: last_name,
      imageUrl: image_url,
      createdAt: new Date(created_at || Date.now()),
      metadata: userData
    });

    console.log(`User created: ${id}`);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

async function handleUserUpdated(userData: ClerkUser) {
  const { id, email_addresses, first_name, last_name, image_url } = userData;
  
  const primaryEmail = email_addresses?.find((email) => email.id === userData.primary_email_address_id)?.email_address;

  try {
    await upsertUser(id, {
      email: primaryEmail,
      firstName: first_name,
      lastName: last_name,
      imageUrl: image_url,
      metadata: userData
    });

    console.log(`User upserted: ${id}`);
  } catch (error) {
    console.error('Error upserting user:', error);
    throw error;
  }
}

async function handleUserDeleted(userData: ClerkUser) {
  const { id } = userData;

  try {
    await deleteUser(id);
    console.log(`User deleted: ${id}`);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

async function handleSessionCreated(sessionData: ClerkSession) {
  const { user_id } = sessionData;

  try {
    await updateLastSignIn(user_id);
    console.log(`Session created for user: ${user_id}`);
  } catch (error) {
    console.error('Error updating session:', error);
    throw error;
  }
}