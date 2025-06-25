import { NextResponse } from 'next/server';
import { getRecentTidbits } from '@/lib/db/living-essay';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clerkUserId: string }> }
) {
  try {
    const { clerkUserId } = await params;
    
    if (!clerkUserId) {
      return new NextResponse('User ID is required', { status: 400 });
    }

    // Get 2 most recent tidbits for the user
    const tidbits = await getRecentTidbits(clerkUserId, 2);

    return NextResponse.json(tidbits);
  } catch (error) {
    console.error('Error fetching tidbits:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 