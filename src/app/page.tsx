'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Devotional } from '@/types/devotional';

interface RandomVerse {
  text: string;
  reference: string;
  book: string;
  chapter: number;
  verse: number;
}

function getTodayKey() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}

function getDayIndex() {
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 0);
  return Math.floor((today.getTime() - start.getTime()) / 86400000);
}

export default function HomePage() {
  const [wordOfDay, setWordOfDay] = useState<RandomVerse | null>(null);
  const [randomWord, setRandomWord] = useState<RandomVerse | null>(null);
  const [devotionalOfDay, setDevotionalOfDay] = useState<Devotional | null>(null);
  const [devotionalsAll, setDevotionalsAll] = useState<Devotional[]>([]);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [loadingRandom, setLoadingRandom] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRandomWord = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/bible/random', { cache: 'no-store' });
      const verse = await response.json();
      if (!verse.error) setRandomWord(verse);
    } finally {
      setRefreshing(false);
      setLoadingRandom(false);
    }
  };

  useEffect(() => {
    const todayKey = getTodayKey();
    const storageKey = `bible-is-open-word-of-day-${todayKey}`;
    const cached = localStorage.getItem(storageKey);

    if (cached) {
      try {
        setWordOfDay(JSON.parse(cached));
        setLoadingDaily(false);
        return;
      } catch {
        localStorage.removeItem(storageKey);
      }
    }

    fetch('/api/bible/random', { cache: 'no-store' })
      .then((response) => response.json())
      .then((verse: RandomVerse) => {
        if (!verse.reference) return;
        setWordOfDay(verse);
        localStorage.setItem(storageKey, JSON.stringify(verse));
      })
      .finally(() => setLoadingDaily(false));
  }, []);

  useEffect(() => {
    loadRandomWord();
  }, []);

  useEffect(() => {
    fetch('/devotionals.json')
      .then((response) => response.json())
      .then((devotionals: Devotional[]) => {
        setDevotionalsAll(devotionals);
        const dailyIndex = getDayIndex() % devotionals.length;
        setDevotionalOfDay(devotionals[dailyIndex]);
      });
  }, []);

  const VerseCard = ({ verse, loading, label }: { verse: RandomVerse | null; loading?: boolean; label: string }) => (
    <Link
      href={verse ? `/bible?book=${verse.book}&chapter=${verse.chapter}` : '#'}
      className="flex min-h-40 w-full flex-col justify-between border border-[var(--medium-gray)] bg-[var(--white)] p-5 transition hover:border-[var(--light-blue)] hover:shadow-md group"
    >
      <span className=" md:text-sm lg:text-lg font-bold font-semibold uppercase tracking-wide text-[var(--light-blue)]">{label}</span>
      {loading || !verse ? (
        <p className="text-sm text-[var(--dark-gray)]/40">Carregando...</p>
      ) : (
        <>
          <p className="text-sm leading-relaxed text-[var(--dark-gray)] break-words [overflow-wrap:anywhere]">
            &ldquo;{verse.text}&rdquo;
          </p>
          <p className="mt-4 text-xs font-semibold text-[var(--light-blue)]">{verse.reference}</p>
        </>
      )}
    </Link>
  );
  const RefreshBtn = () => {
    return (
      <button
        type="button"
        onClick={loadRandomWord}
        disabled={refreshing}
        aria-label="Atualizar palavra aleatória"
        title="Nova palavra aleatória"
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--light-blue)] text-white shadow-sm transition hover:rotate-180 hover:opacity-90 disabled:opacity-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992V4.356m-1.148 4.992a8.25 8.25 0 1 0 1.148 4.992" />
        </svg>
      </button>
    )
  }
  const DevotionalCard = ({ devotional, label }: { devotional: Devotional | null; label: string }) => {
    const index = devotional ? devotionalsAll.findIndex((item) => item.title === devotional.title) : -1;
    return (
      <Link
        href={index >= 0 ? `/devotionals/viewer?i=${index}` : '#'}
        className="block min-h-40 w-full border border-[var(--medium-gray)] bg-[var(--white)] p-5 transition hover:border-[var(--light-blue)] hover:shadow-md group"
      >
        <span className="md:text-sm lg:text-lg font-semibold uppercase tracking-wide text-[var(--light-blue)]">{label}</span>
        {!devotional ? (
          <p className="text-sm text-[var(--dark-gray)]/40">Carregando...</p>
        ) : (
          <>
            <h3 className="flex items-center justify-center mt-5 line-clamp-2 text-base font-bold leading-snug text-[var(--dark-gray)]">{devotional.title}</h3>
            <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[var(--dark-gray)]/65 break-words [overflow-wrap:anywhere]">
              {devotional.body.replace(/\*\*/g, '').replace(/\n/g, ' ').slice(0, 160)}...
            </p>
            <span className="mt-3 self-start rounded-full bg-[var(--light-blue)]/15 px-2 py-0.5 text-xs text-[var(--light-blue)]">
              {devotional.theme}
            </span>
          </>
        )}
      </Link>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl p-4 sm:p-6 lg:p-8">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--dark-gray)] sm:text-3xl">Bible Is Open</h1>
          <p className="mt-2 text-sm text-[var(--dark-gray)]/55">Seu companheiro de fé diária</p>
        </header>

        <section className="flex w-full flex-col gap-6">
          <article className="w-full space-y-2">

            <VerseCard verse={wordOfDay} loading={loadingDaily} label='Palavra do Dia' />
          </article>

          <article className="w-full space-y-2">

            <DevotionalCard devotional={devotionalOfDay} label="Devocional do Dia" />
          </article>

          <article className="w-full space-y-2">
            <div className="relative">
              <VerseCard verse={randomWord} loading={loadingRandom} label="Palavra Aleatória" />
              <div className="absolute right-3 top-3">
                <RefreshBtn />
              </div>
            </div>
          </article>

        </section>
      </div>
    </div>
  );
}
