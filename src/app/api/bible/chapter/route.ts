import { NextRequest, NextResponse } from 'next/server';
import { getChapter } from '@/lib/bibleApi';

export async function GET(request: NextRequest) {
  const version = request.nextUrl.searchParams.get('version') || 'ACF';
  const book = request.nextUrl.searchParams.get('book');
  const chapter = request.nextUrl.searchParams.get('chapter') || '1';

  if (!book) {
    return NextResponse.json({ error: 'Book parameter is required' }, { status: 400 });
  }

  try {
    const data = await getChapter(version, book, Number(chapter));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch chapter' }, { status: 503 });
  }
}
