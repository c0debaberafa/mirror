import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { supabase } from '@/lib/supabase';

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

  let evt: any;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
  console.log('Webhook body:', body);

  // Handle the webhook
  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt.data);
        break;
      case 'user.updated':
        await handleUserUpdated(evt.data);
        break;
      case 'user.deleted':
        await handleUserDeleted(evt.data);
        break;
      case 'session.created':
        await handleSessionCreated(evt.data);
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

async function handleUserCreated(userData: any) {
  const { id, email_addresses, first_name, last_name, image_url, created_at } = userData;
  
  const primaryEmail = email_addresses?.find((email: any) => email.id === userData.primary_email_address_id)?.email_address;

  const { error } = await supabase
    .from('users')
    .insert({
      clerk_user_id: id,
      email: primaryEmail,
      first_name,
      last_name,
      image_url,
      created_at: new Date(created_at).toISOString(),
      updated_at: new Date().toISOString(),
      metadata: userData
    });

  if (error) {
    console.error('Error creating user:', error);
    throw error;
  }

  console.log(`User created: ${id}`);
}

async function handleUserUpdated(userData: any) {
  const { id, email_addresses, first_name, last_name, image_url, updated_at } = userData;
  
  const primaryEmail = email_addresses?.find((email: any) => email.id === userData.primary_email_address_id)?.email_address;

  const { error } = await supabase
    .from('users')
    .update({
      email: primaryEmail,
      first_name,
      last_name,
      image_url,
      updated_at: new Date().toISOString(),
      metadata: userData
    })
    .eq('clerk_user_id', id);

  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }

  console.log(`User updated: ${id}`);
}

async function handleUserDeleted(userData: any) {
  const { id } = userData;

  const { error } = await supabase
    .from('users')
    .update({
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('clerk_user_id', id);

  if (error) {
    console.error('Error deleting user:', error);
    throw error;
  }

  console.log(`User deleted: ${id}`);
}

async function handleSessionCreated(sessionData: any) {
  const { user_id } = sessionData;

  const { error } = await supabase
    .from('users')
    .update({
      last_sign_in_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('clerk_user_id', user_id);

  if (error) {
    console.error('Error updating session:', error);
    throw error;
  }

  console.log(`Session created for user: ${user_id}`);
}