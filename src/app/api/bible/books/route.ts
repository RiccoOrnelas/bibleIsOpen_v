import { NextRequest, NextResponse } from 'next/server';
import { getBooks } from '@/lib/bibleApi';

export async function GET(request: NextRequest) {
  try {
    const version = request.nextUrl.searchParams.get('version') || 'ACF';
    return NextResponse.json(await getBooks(version));
  } catch {
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 503 });
  }
}
