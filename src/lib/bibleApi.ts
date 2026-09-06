import bibleLivreData from '@/data/bibles/biblia-livre.json';
import jfaData from '@/data/bibles/jfa.json';
import { BOOK_CHAPTERS } from '@/lib/bibleBooks';

export interface BibleBook {
  id: number;
  name: string;
  abbrev: string;
  testament: 'VT' | 'NT';
}

export interface BibleVerse {
  number: number;
  text: string;
}

export interface BibleChapter {
  reference: string;
  version: string;
  chapter: { number: number; verses: number };
  verses: BibleVerse[];
}

export interface AvailableBibleVersion {
  code: string;
  name: string;
  source: 'local' | 'primary' | 'bolls';
}

interface StoredBibleBook extends BibleBook {
  chapters: string[][];
}

interface StoredBible {
  code: string;
  name: string;
  books: StoredBibleBook[];
}

interface BibleVersionDefinition {
  code: string;
  name: string;
  primaryCode: string;
  bollsCode?: string;
  local?: StoredBible;
}

interface PrimaryBooksResponse {
  data?: BibleBook[];
}

interface PrimaryChapterResponse {
  data?: {
    reference?: string;
    version?: string;
    chapter?: { number?: number; verses?: number };
    verses?: { number?: number; text?: string }[];
  };
}

interface BollsVerse {
  verse?: number;
  text?: string;
}

const PRIMARY_API_BASE = (process.env.BIBLE_API_BASE || 'https://bibliaapi.com.br/api/v2').replace(/\/$/, '');
const PRIMARY_API_KEY = process.env.BIBLE_API_KEY;
const BOLLS_API_BASE = 'https://bolls.life';
const REQUEST_TIMEOUT_MS = 5000;
const AVAILABILITY_CACHE_MS = 60_000;

const localBibleLivre = bibleLivreData as unknown as StoredBible;
const localJfa = jfaData as unknown as StoredBible;

const VERSION_DEFINITIONS: BibleVersionDefinition[] = [
  { code: 'ACF', name: 'Almeida Corrigida Fiel', primaryCode: 'ACF', bollsCode: 'ACF11' },
  { code: 'NVI', name: 'Nova Versão Internacional', primaryCode: 'NVI', bollsCode: 'NVIPT' },
  { code: 'KJF', name: 'King James Fiel', primaryCode: 'KJF' },
  { code: 'BL', name: 'Bíblia Livre', primaryCode: 'BL', local: localBibleLivre },
  { code: 'JFA', name: 'João Ferreira de Almeida', primaryCode: 'JFA', local: localJfa },
];

let availabilityCache: { expiresAt: number; value: AvailableBibleVersion[] } | null = null;

class ProviderError extends Error {
  constructor(public readonly provider: string, public readonly status?: number) {
    super(`${provider} Bible provider failed${status ? ` with status ${status}` : ''}`);
  }
}

async function requestJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...init,
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new ProviderError(url, response.status);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    throw new ProviderError(url);
  } finally {
    clearTimeout(timeout);
  }
}

function primaryHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...(PRIMARY_API_KEY ? { Authorization: `Bearer ${PRIMARY_API_KEY}` } : {}),
  };
}

async function fetchPrimary<T>(path: string): Promise<T> {
  if (!PRIMARY_API_KEY) {
    throw new ProviderError('primary');
  }

  return requestJson<T>(`${PRIMARY_API_BASE}${path}`, { headers: primaryHeaders() });
}

async function fetchBolls<T>(path: string): Promise<T> {
  return requestJson<T>(`${BOLLS_API_BASE}${path}`);
}

function getDefinition(code: string): BibleVersionDefinition | undefined {
  return VERSION_DEFINITIONS.find((version) => version.code === code.toUpperCase());
}

function getCanonicalBooks(): BibleBook[] {
  return localBibleLivre.books.map((book) => ({
    id: book.id,
    name: book.name,
    abbrev: book.abbrev,
    testament: book.testament,
  }));
}

function getBook(abbrev: string): BibleBook | undefined {
  return getCanonicalBooks().find((book) => book.abbrev === abbrev);
}

function stripHtml(text: string): string {
  return text
    .replace(/<br\s*\/?>(\r?\n)?/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, '&')
    .trim();
}

function localChapter(version: BibleVersionDefinition, abbrev: string, chapter: number): BibleChapter {
  if (!version.local) {
    throw new ProviderError('local');
  }

  const book = version.local.books.find((item) => item.abbrev === abbrev);
  const verses = book?.chapters[chapter - 1];

  if (!book || !verses) {
    throw new ProviderError('local', 404);
  }

  return {
    reference: `${book.name} ${chapter}`,
    version: version.name,
    chapter: { number: chapter, verses: verses.length },
    verses: verses.map((text, index) => ({ number: index + 1, text })),
  };
}

function normalizePrimaryChapter(payload: PrimaryChapterResponse, version: BibleVersionDefinition, abbrev: string, chapter: number): BibleChapter {
  const data = payload.data;
  const book = getBook(abbrev);
  const verses = (data?.verses || [])
    .filter((verse): verse is { number: number; text: string } => typeof verse.number === 'number' && typeof verse.text === 'string')
    .map((verse) => ({ number: verse.number, text: stripHtml(verse.text) }));

  return {
    reference: data?.reference || `${book?.name || abbrev} ${chapter}`,
    version: data?.version || version.name,
    chapter: {
      number: data?.chapter?.number || chapter,
      verses: data?.chapter?.verses || verses.length,
    },
    verses,
  };
}

function normalizeBollsChapter(payload: BollsVerse[], version: BibleVersionDefinition, abbrev: string, chapter: number): BibleChapter {
  const book = getBook(abbrev);
  const verses = payload
    .filter((verse): verse is { verse: number; text: string } => typeof verse.verse === 'number' && typeof verse.text === 'string')
    .map((verse) => ({ number: verse.verse, text: stripHtml(verse.text) }));

  return {
    reference: `${book?.name || abbrev} ${chapter}`,
    version: version.name,
    chapter: { number: chapter, verses: verses.length },
    verses,
  };
}

async function checkPrimaryVersion(version: BibleVersionDefinition): Promise<boolean> {
  if (!PRIMARY_API_KEY) return false;

  try {
    await fetchPrimary(`/versions/${version.primaryCode}`);
    return true;
  } catch {
    return false;
  }
}

async function checkBollsVersion(version: BibleVersionDefinition): Promise<boolean> {
  if (!version.bollsCode) return false;

  try {
    await fetchBolls(`/get-books/${version.bollsCode}/`);
    return true;
  } catch {
    return false;
  }
}

export async function getAvailableVersions(force = false): Promise<AvailableBibleVersion[]> {
  if (!force && availabilityCache && availabilityCache.expiresAt > Date.now()) {
    return availabilityCache.value;
  }

  const available = (await Promise.all(VERSION_DEFINITIONS.map(async (version) => {
    if (version.local) {
      return { code: version.code, name: version.name, source: 'local' as const };
    }

    const [primaryAvailable, bollsAvailable] = await Promise.all([
      checkPrimaryVersion(version),
      checkBollsVersion(version),
    ]);

    if (primaryAvailable) {
      return { code: version.code, name: version.name, source: 'primary' as const };
    }

    if (bollsAvailable) {
      return { code: version.code, name: version.name, source: 'bolls' as const };
    }

    return null;
  }))).filter((version): version is AvailableBibleVersion => version !== null);

  availabilityCache = { expiresAt: Date.now() + AVAILABILITY_CACHE_MS, value: available };
  return available;
}

async function resolveVersion(requestedCode?: string): Promise<AvailableBibleVersion> {
  const available = await getAvailableVersions();
  const requested = requestedCode?.toUpperCase();
  return available.find((version) => version.code === requested) || available[0];
}

export async function getBooks(requestedCode = 'ACF') {
  const resolved = await resolveVersion(requestedCode);

  if (resolved.source === 'primary') {
    try {
      const response = await fetchPrimary<PrimaryBooksResponse>('/books');
      if (response.data?.length) {
        return { data: response.data, version: resolved.code, versionName: resolved.name };
      }
    } catch {
      // The standby provider below is used when the primary fails after the pre-check.
    }
  }

  return {
    data: getCanonicalBooks(),
    version: resolved.code,
    versionName: resolved.name,
  };
}

export async function getChapter(requestedCode: string, abbrev: string, chapter: number) {
  const resolved = await resolveVersion(requestedCode);
  const definition = getDefinition(resolved.code);

  if (!definition) {
    throw new ProviderError('version', 404);
  }

  if (definition.local) {
    return { data: localChapter(definition, abbrev, chapter), version: resolved.code };
  }

  if (resolved.source === 'primary') {
    try {
      const response = await fetchPrimary<PrimaryChapterResponse>(`/versions/${definition.primaryCode}/books/${abbrev}/chapters/${chapter}`);
      return { data: normalizePrimaryChapter(response, definition, abbrev, chapter), version: resolved.code };
    } catch {
      // Try the equivalent Bolls translation without changing the requested version.
    }
  }

  if (definition.bollsCode) {
    try {
      const book = getBook(abbrev);
      if (!book) throw new ProviderError('book', 404);
      const response = await fetchBolls<BollsVerse[]>(`/get-text/${definition.bollsCode}/${book.id}/${chapter}/`);
      return { data: normalizeBollsChapter(response, definition, abbrev, chapter), version: resolved.code };
    } catch {
      // Fall through to a final primary attempt when the availability check was stale.
    }
  }

  try {
    const response = await fetchPrimary<PrimaryChapterResponse>(`/versions/${definition.primaryCode}/books/${abbrev}/chapters/${chapter}`);
    return { data: normalizePrimaryChapter(response, definition, abbrev, chapter), version: resolved.code };
  } catch {
    throw new ProviderError('bible', 503);
  }
}

function randomLocalVerse(version: BibleVersionDefinition): { text: string; reference: string; book: string; chapter: number; verse: number; version: string } {
  if (!version.local) throw new ProviderError('local');

  const book = version.local.books[Math.floor(Math.random() * version.local.books.length)];
  const chapter = Math.floor(Math.random() * book.chapters.length) + 1;
  const verses = book.chapters[chapter - 1];
  const verse = Math.floor(Math.random() * verses.length) + 1;

  return {
    text: verses[verse - 1],
    reference: `${book.name} ${chapter}:${verse}`,
    book: book.abbrev,
    chapter,
    verse,
    version: version.code,
  };
}

export async function getRandomVerse(requestedCode = 'ACF') {
  const resolved = await resolveVersion(requestedCode);
  const definition = getDefinition(resolved.code);

  if (!definition) throw new ProviderError('version', 404);
  if (definition.local) return randomLocalVerse(definition);

  if (resolved.source === 'bolls' && definition.bollsCode) {
    try {
      const response = await fetchBolls<{ book?: number; chapter?: number; verse?: number; text?: string }>(`/get-random-verse/${definition.bollsCode}/`);
      const book = response.book ? getCanonicalBooks().find((item) => item.id === response.book) : undefined;
      if (book && response.chapter && response.verse && response.text) {
        return {
          text: stripHtml(response.text),
          reference: `${book.name} ${response.chapter}:${response.verse}`,
          book: book.abbrev,
          chapter: response.chapter,
          verse: response.verse,
          version: resolved.code,
        };
      }
    } catch {
      // The chapter fallback below handles a temporary random endpoint failure.
    }
  }

  const book = getCanonicalBooks()[Math.floor(Math.random() * getCanonicalBooks().length)];
  const chapter = Math.floor(Math.random() * (BOOK_CHAPTERS[book.abbrev] || 1)) + 1;
  const response = await getChapter(resolved.code, book.abbrev, chapter);
  const verse = response.data.verses[Math.floor(Math.random() * response.data.verses.length)];

  if (!verse) throw new ProviderError('bible', 503);

  return {
    text: verse.text,
    reference: `${response.data.reference}:${verse.number}`,
    book: book.abbrev,
    chapter,
    verse: verse.number,
    version: response.version,
  };
}
