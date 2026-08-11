import { NextResponse } from 'next/server';
import { fetchBible } from '@/lib/bibleApi';

export async function GET() {
  try {
    const data = await fetchBible<{ data: { id: number; name: string; abbrev: string; testament: string }[] }>('/books');
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}
