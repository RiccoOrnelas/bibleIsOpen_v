'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getChapterCount } from '@/lib/bibleBooks';

interface Book {
  id: number;
  name: string;
  abbrev: string;
  testament: string;
}

interface VerseData {
  number: number;
  text: string;
}

interface ChapterData {
  reference: string;
  version: string;
  chapter: { number: number; verses: number };
  verses: VerseData[];
}

const VERSIONS = [
  { code: 'ACF', name: 'Almeida Corrigida Fiel' },
  { code: 'NVI', name: 'Nova Versão Internacional' },
  { code: 'KJF', name: 'King James Fiel' },
];

function BibleContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [chapterNum, setChapterNum] = useState(1);
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [version, setVersion] = useState('ACF');
  const [selectedVerses, setSelectedVerses] = useState<Set<number>>(new Set());
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const [showChapters, setShowChapters] = useState(false);

  const clearSelection = useCallback(() => setSelectedVerses(new Set()), []);

  useEffect(() => {
    fetch('/api/bible/books')
      .then((r) => r.json())
      .then((d) => setBooks(d.data))
      .catch(() => setError('Erro ao carregar livros'));
  }, []);

  useEffect(() => {
    const qBook = searchParams.get('book');
    const qChapter = searchParams.get('chapter');
    if (!qBook || books.length === 0) return;
    const book = books.find((b) => b.abbrev === qBook);
    if (book) {
      setSelectedBook(book);
      setChapterNum(Number(qChapter) || 1);
      setShowChapters(false);
    }
  }, [searchParams, books]);

  useEffect(() => {
    if (!selectedBook) return;
    setLoading(true);
    setError('');
    clearSelection();

    fetch(`/api/bible/chapter?version=${version}&book=${selectedBook.abbrev}&chapter=${chapterNum}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setChapterData(null);
          setError('Capítulo não encontrado');
        } else {
          setChapterData(d.data);
          setError('');
        }
      })
      .catch(() => {
        setChapterData(null);
        setError('Erro ao carregar capítulo');
      })
      .finally(() => setLoading(false));
  }, [selectedBook, chapterNum, version, clearSelection]);

  const formatVerseCopy = (verse: VerseData): string => {
    const ref = chapterData!.reference;
    return `"${verse.text}" **${ref}:${verse.number}**`;
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 1200);
  };

  const handleVerseClick = (verse: VerseData) => {
    setSelectedVerses((prev) => {
      const next = new Set(prev);
      if (next.has(verse.number)) {
        next.delete(verse.number);
      } else {
        next.add(verse.number);
      }
      return next;
    });
  };

  const handleVerseContextMenu = (verse: VerseData, e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedVerses.has(verse.number) && selectedVerses.size > 1) {
      const verses = chapterData!.verses.filter((v) => selectedVerses.has(v.number));
      const sorted = [...verses].sort((a, b) => a.number - b.number);
      const text = sorted.map(formatVerseCopy).join('\n');
      copyToClipboard(text);
    } else {
      setSelectedVerses(new Set([verse.number]));
      copyToClipboard(formatVerseCopy(verse));
    }
  };

  const vtBooks = books.filter((b) => b.testament === 'VT');
  const ntBooks = books.filter((b) => b.testament === 'NT');

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setChapterNum(1);
    setShowChapters(true);
    router.replace('/bible', { scroll: false });
  };

  const handleChapterSelect = (ch: number) => {
    setChapterNum(ch);
    setShowChapters(false);
  };

  const chapterCount = selectedBook ? getChapterCount(selectedBook.abbrev) : 0;

  return (
    <div className="flex h-full">
      <aside className="w-52 sm:w-64 flex-shrink-0 border-r border-[var(--medium-gray)] bg-[var(--white)] overflow-y-auto">
        <div className="p-3 border-b border-[var(--medium-gray)]">
          <label className="text-xs text-[var(--dark-gray)]/60 block mb-1">Versão</label>
          <select
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="w-full px-2 py-1.5 text-sm rounded-lg border border-[var(--medium-gray)] bg-[var(--white)] text-[var(--dark-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--light-blue)]"
          >
            {VERSIONS.map((v) => (
              <option key={v.code} value={v.code}>{v.name}</option>
            ))}
          </select>
        </div>

        {vtBooks.length > 0 && (
          <div>
            <h3 className="px-3 pt-3 pb-1 text-xs font-semibold text-[var(--dark-gray)]/50 uppercase tracking-wider">Velho Testamento</h3>
            {vtBooks.map((book) => (
              <button
                key={book.id}
                onClick={() => handleBookClick(book)}
                className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                  selectedBook?.id === book.id
                    ? 'bg-[var(--light-blue)]/20 text-[var(--light-blue)] font-semibold'
                    : 'text-[var(--dark-gray)] hover:bg-[var(--medium-gray)]'
                }`}
              >
                {book.name}
              </button>
            ))}
          </div>
        )}

        {ntBooks.length > 0 && (
          <div>
            <h3 className="px-3 pt-4 pb-1 text-xs font-semibold text-[var(--dark-gray)]/50 uppercase tracking-wider">Novo Testamento</h3>
            {ntBooks.map((book) => (
              <button
                key={book.id}
                onClick={() => handleBookClick(book)}
                className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                  selectedBook?.id === book.id
                    ? 'bg-[var(--light-blue)]/20 text-[var(--light-blue)] font-semibold'
                    : 'text-[var(--dark-gray)] hover:bg-[var(--medium-gray)]'
                }`}
              >
                {book.name}
              </button>
            ))}
          </div>
        )}
      </aside>

      <div className="flex-1 overflow-y-auto bg-[var(--background)]">
        {!selectedBook && (
          <div className="flex items-center justify-center h-full text-[var(--dark-gray)]/40">
            <p>Selecione um livro para começar a leitura</p>
          </div>
        )}

        {selectedBook && showChapters && (
          <div className="max-w-3xl mx-auto p-4 sm:p-6">
            <h2 className="text-xl font-bold text-[var(--dark-gray)] mb-4">
              {selectedBook.name} — Capítulos
            </h2>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {Array.from({ length: chapterCount }, (_, i) => i + 1).map((ch) => (
                <button
                  key={ch}
                  onClick={() => handleChapterSelect(ch)}
                  className="px-3 py-2 text-sm rounded-lg border border-[var(--medium-gray)] bg-[var(--white)] text-[var(--dark-gray)] hover:bg-[var(--light-blue)]/10 hover:border-[var(--light-blue)] transition-colors"
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && !showChapters && (
          <div className="p-8 text-center text-red-500">{error}</div>
        )}

        {loading && !showChapters && (
          <div className="p-8 text-center text-[var(--dark-gray)]/60">Carregando...</div>
        )}

        {chapterData && !loading && !showChapters && (
          <div className="max-w-3xl mx-auto p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--dark-gray)]">
                {chapterData.reference}
              </h2>
              <button
                onClick={() => setShowChapters(true)}
                className="text-xs px-2 py-1 rounded border border-[var(--medium-gray)] text-[var(--dark-gray)]/60 hover:bg-[var(--medium-gray)] transition-colors"
                title="Ver capítulos"
              >
                Capítulos
              </button>
              {selectedVerses.size > 0 && (
                <button
                  onClick={clearSelection}
                  className="text-xs px-2 py-1 rounded-full border border-[var(--medium-gray)] text-[var(--dark-gray)]/60 hover:bg-[var(--medium-gray)] transition-colors"
                >
                  {selectedVerses.size} ✕
                </button>
              )}
            </div>
            <p className="text-xs text-[var(--dark-gray)]/50 mb-6">{chapterData.version}</p>

            {copiedFeedback && (
              <div className="fixed bottom-20 right-4 z-50 px-4 py-2 rounded-lg bg-[var(--light-blue)] text-white text-sm shadow-lg animate-pulse">
                Copiado!
              </div>
            )}

            <div className="space-y-1">
              {chapterData.verses.map((verse) => {
                const isSelected = selectedVerses.has(verse.number);
                return (
                  <p
                    key={verse.number}
                    onClick={() => handleVerseClick(verse)}
                    onContextMenu={(e) => handleVerseContextMenu(verse, e)}
                    className={`text-base leading-relaxed text-[var(--dark-gray)] cursor-pointer rounded px-2 py-0.5 -mx-2 transition-colors duration-150 select-none ${
                      isSelected
                        ? 'bg-[var(--light-blue)]/25'
                        : 'hover:bg-[var(--medium-gray)]/40'
                    }`}
                  >
                    <span className="text-xs font-bold text-[var(--light-blue)] mr-1 align-super select-none">
                      {verse.number}
                    </span>
                    {verse.text}
                  </p>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--medium-gray)]">
              <button
                onClick={() => setChapterNum((c) => Math.max(c - 1, 1))}
                disabled={chapterNum <= 1}
                className="px-4 py-2 text-sm rounded-lg border border-[var(--medium-gray)] bg-[var(--white)] text-[var(--dark-gray)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--medium-gray)] transition-colors"
              >
                Anterior
              </button>

              <span className="text-sm text-[var(--dark-gray)]/60">
                Capítulo {chapterNum}
                {chapterData.chapter.verses > 0 && ` — ${chapterData.chapter.verses} versículos`}
              </span>

              <button
                onClick={() => setChapterNum((c) => c + 1)}
                className="px-4 py-2 text-sm rounded-lg border border-[var(--medium-gray)] bg-[var(--white)] text-[var(--dark-gray)] hover:bg-[var(--medium-gray)] transition-colors"
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BiblePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full text-[var(--dark-gray)]/40">Carregando...</div>}>
      <BibleContent />
    </Suspense>
  );
}
