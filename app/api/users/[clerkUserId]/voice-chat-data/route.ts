import { NextRequest, NextResponse } from 'next/server';
import { getUserDataForVoiceChat } from '@/lib/db/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clerkUserId: string }> }
) {
  try {
    const { clerkUserId } = await params;
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Clerk user ID is required' },
        { status: 400 }
      );
    }

    const userData = await getUserDataForVoiceChat(clerkUserId);
    
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user data for voice chat:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch user data',
        onboardingArchetypes: 'No onboarding data available.',
        callSummaries: []
      },
      { status: 500 }
    );
  }
} 