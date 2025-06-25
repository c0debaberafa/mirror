import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createLivingEssay, getRecentEssays, getRecentTidbits } from '@/lib/db/living-essay';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const [essays, tidbits] = await Promise.all([
      getRecentEssays(user.id),
      getRecentTidbits(user.id),
    ]);

    return NextResponse.json({ essays, tidbits });
  } catch (error) {
    console.error('Error in GET /api/living-essay:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { sections } = await req.json();
    if (!sections || !Array.isArray(sections)) {
      return new NextResponse('Invalid request body', { status: 400 });
    }

    const essay = await createLivingEssay(user.id, sections);
    return NextResponse.json(essay);
  } catch (error) {
    console.error('Error in POST /api/living-essay:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 