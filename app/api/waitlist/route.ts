import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { waitlist, users } from '@/lib/db/schema';
import { eq, count } from 'drizzle-orm';

const MAX_SLOTS = 50;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { response, clerkUserId } = body;

    if (!response || !clerkUserId) {
      return NextResponse.json(
        { message: 'Response and clerkUserId are required' },
        { status: 400 }
      );
    }

    // Look up user by clerkUserId
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId))
      .limit(1);
    const user = userResult[0];

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already on waitlist (only if user.email exists)
    if (user.email) {
      const existingEntry = await db
        .select()
        .from(waitlist)
        .where(eq(waitlist.email, user.email))
        .limit(1);

      if (existingEntry.length > 0) {
        return NextResponse.json(
          { message: 'You are already on the waitlist!' },
          { status: 409 }
        );
      }
    }

    // Check remaining slots
    const totalEntriesResult = await db
      .select({ count: count() })
      .from(waitlist);

    const totalEntries = totalEntriesResult[0]?.count || 0;

    if (totalEntries >= MAX_SLOTS) {
      return NextResponse.json(
        { message: 'Sorry, the waitlist is full!' },
        { status: 403 }
      );
    }

    // Add to waitlist
    await db.insert(waitlist).values({
      email: user.email || '',
      name: user.firstName || '',
      response,
    });

    return NextResponse.json(
      { message: 'Successfully added to waitlist' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Waitlist submission error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const totalEntriesResult = await db
      .select({ count: count() })
      .from(waitlist);

    const totalEntries = totalEntriesResult[0]?.count || 0;
    const remainingSlots = Math.max(0, MAX_SLOTS - totalEntries);

    return NextResponse.json({
      totalEntries,
      remainingSlots,
      maxSlots: MAX_SLOTS,
    });
  } catch (error) {
    console.error('Waitlist stats error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 