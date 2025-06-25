import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createLivingEssay, getRecentEssays, getRecentTidbits } from '@/lib/db/living-essay';

export async function GET() {
  console.log('API: GET /api/living-essay called');
  try {
    const user = await currentUser();
    console.log('API: Current user:', user?.id ? 'Authenticated' : 'Not authenticated');
    
    if (!user?.id) {
      console.log('API: Unauthorized - no user ID');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log('API: Fetching essays and tidbits for user:', user.id);
    const [essays, tidbits] = await Promise.all([
      getRecentEssays(user.id),
      getRecentTidbits(user.id),
    ]);

    console.log('API: Retrieved data:', { essaysCount: essays.length, tidbitsCount: tidbits.length });
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