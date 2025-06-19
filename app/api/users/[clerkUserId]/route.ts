import { NextRequest, NextResponse } from 'next/server';
import { getUserByClerkId } from '@/lib/db/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clerkUserId: string }> }
): Promise<NextResponse> {
  try {
    const { clerkUserId } = await params;

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Clerk user ID is required' },
        { status: 400 }
      );
    }

    const user = await getUserByClerkId(clerkUserId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 