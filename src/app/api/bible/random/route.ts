import { NextResponse } from 'next/server';
import { getRandomVerse } from '@/lib/bibleApi';

export async function GET() {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return NextResponse.json(await getRandomVerse());
    } catch {
      // Try another chapter before returning an error to the client.
    }
  }

  return NextResponse.json({ error: 'Failed to get random verse' }, { status: 503 });
}
