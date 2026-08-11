import { NextResponse } from 'next/server';
import { fetchBible } from '@/lib/bibleApi';
import { BOOK_CHAPTERS, getRandomChapter } from '@/lib/bibleBooks';

const BOOK_ABBREVS = Object.keys(BOOK_CHAPTERS);

async function getRandomVerse(): Promise<{ text: string; reference: string; book: string; chapter: number; verse: number } | null> {
  const abbrev = BOOK_ABBREVS[Math.floor(Math.random() * BOOK_ABBREVS.length)];
  const chapter = getRandomChapter(abbrev);

  try {
    const data = await fetchBible<{
      data: { reference: string; verses: { number: number; text: string }[] };
    }>(`/versions/ACF/books/${abbrev}/chapters/${chapter}`);

    const verses = data.data.verses;
    if (verses.length === 0) return null;

    const verse = verses[Math.floor(Math.random() * verses.length)];
    return {
      text: verse.text,
      reference: `${data.data.reference}:${verse.number}`,
      book: abbrev,
      chapter,
      verse: verse.number,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  let verse = null;
  for (let i = 0; i < 5; i++) {
    verse = await getRandomVerse();
    if (verse) break;
  }

  if (!verse) {
    return NextResponse.json({ error: 'Failed to get random verse' }, { status: 500 });
  }

  return NextResponse.json(verse);
}
