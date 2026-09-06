import { NextResponse } from 'next/server';
import { getAvailableVersions } from '@/lib/bibleApi';

export async function GET() {
  try {
    const data = await getAvailableVersions();
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Failed to check Bible versions' }, { status: 503 });
  }
}
