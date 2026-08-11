import { NextRequest, NextResponse } from 'next/server';
import { fetchBible } from '@/lib/bibleApi';

export async function GET(request: NextRequest) {
  const version = request.nextUrl.searchParams.get('version') || 'ACF';
  const book = request.nextUrl.searchParams.get('book');
  const chapter = request.nextUrl.searchParams.get('chapter') || '1';

  if (!book) {
    return NextResponse.json({ error: 'Book parameter is required' }, { status: 400 });
  }

  try {
    const data = await fetchBible<{
      data: {
        reference: string;
        version: string;
        chapter: { number: number; verses: number };
        verses: { number: number; text: string }[];
      };
    }>(`/versions/${version}/books/${book}/chapters/${chapter}`);

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch chapter' }, { status: 500 });
  }
}
