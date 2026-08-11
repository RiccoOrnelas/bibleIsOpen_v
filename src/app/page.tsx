'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Devotional } from '@/types/devotional';

interface RandomVerse {
  text: string;
  reference: string;
  book: string;
  chapter: number;
  verse: number;
}

function useDayIndex(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

export default function HomePage() {
  const dayIndex = useDayIndex();

  const [wordOfDay, setWordOfDay] = useState<RandomVerse | null>(null);
  const [randomWord, setRandomWord] = useState<RandomVerse | null>(null);
  const [devotionalOfDay, setDevotionalOfDay] = useState<Devotional | null>(null);
  const [randomDevotional, setRandomDevotional] = useState<Devotional | null>(null);
  const [loadingVerse, setLoadingVerse] = useState(true);
  const [loadingRandom, setLoadingRandom] = useState(true);

  useEffect(() => {
    fetch(`/api/bible/random?seed=day`).then((r) => r.json()).then((d) => {
      if (!d.error) setWordOfDay(d);
      setLoadingVerse(false);
    }).catch(() => setLoadingVerse(false));
  }, []);

  useEffect(() => {
    fetch(`/api/bible/random`).then((r) => r.json()).then((d) => {
      if (!d.error) setRandomWord(d);
      setLoadingRandom(false);
    }).catch(() => setLoadingRandom(false));
  }, []);

  const [devotionalsAll, setDevotionalsAll] = useState<Devotional[]>([]);

  useEffect(() => {
    fetch('/devotionals.json').then((r) => r.json()).then((devs: Devotional[]) => {
      setDevotionalsAll(devs);
      const safeIndex = dayIndex % devs.length;
      setDevotionalOfDay(devs[safeIndex]);
      let randIdx = Math.floor(Math.random() * devs.length);
      if (randIdx === safeIndex) randIdx = (randIdx + 1) % devs.length;
      setRandomDevotional(devs[randIdx]);
    });
  }, [dayIndex]);

  const VerseCard = ({ verse, label }: { verse: RandomVerse | null; label: string }) => (
    <Link
      href={verse ? `/bible?book=${verse.book}&chapter=${verse.chapter}` : '#'}
      className="block p-5 rounded-2xl border border-[var(--medium-gray)] bg-[var(--white)] hover:border-[var(--light-blue)] hover:shadow-md transition-all group"
    >
      <span className="text-xs font-semibold text-[var(--light-blue)] uppercase tracking-wide">{label}</span>
      {verse ? (
        <>
          <p className="mt-3 text-sm leading-relaxed text-[var(--dark-gray)] line-clamp-4">
            &ldquo;{verse.text}&rdquo;
          </p>
          <p className="mt-3 text-xs font-semibold text-[var(--light-blue)]">
            {verse.reference}
          </p>
        </>
      ) : (
        <p className="mt-3 text-sm text-[var(--dark-gray)]/40">Carregando...</p>
      )}
    </Link>
  );

  const DevotionalCard = ({ devotional, label }: { devotional: Devotional | null; label: string }) => {
    const idx = devotional ? devotionalsAll.findIndex((d) => d.title === devotional.title) : -1;
    return (
    <Link
      href={idx >= 0 ? `/devotionals/viewer?i=${idx}` : '#'}
      className="block p-5 rounded-2xl border border-[var(--medium-gray)] bg-[var(--white)] hover:border-[var(--light-blue)] hover:shadow-md transition-all group"
    >
      <span className="text-xs font-semibold text-[var(--light-blue)] uppercase tracking-wide">{label}</span>
      {devotional ? (
        <>
          <h3 className="mt-3 text-sm font-bold text-[var(--dark-gray)] group-hover:text-[var(--light-blue)] transition-colors line-clamp-2">
            {devotional.title}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-[var(--dark-gray)]/60 line-clamp-3">
            {devotional.body.replace(/\*\*/g, '').slice(0, 160)}...
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--light-blue)]/15 text-[var(--light-blue)]">
              {devotional.theme}
            </span>
            <span className="text-xs text-[var(--dark-gray)]/40">{devotional.author}</span>
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm text-[var(--dark-gray)]/40">Carregando...</p>
      )}
    </Link>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--dark-gray)] mb-2">
          Bible Is Open
        </h1>
        <p className="text-sm text-[var(--dark-gray)]/50 mb-8">
          Seu companheiro de fé diária
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-5">
            <VerseCard verse={wordOfDay} label="Palavra do Dia" />
            <DevotionalCard devotional={devotionalOfDay} label="Devocional do Dia" />
          </div>
          <div className="space-y-5">
            <VerseCard verse={randomWord} label="Palavra Aleatória" />
            <DevotionalCard devotional={randomDevotional} label="Devocional Aleatório" />
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link href="/bible" className="p-4 rounded-xl border border-[var(--medium-gray)] bg-[var(--white)] text-center text-sm font-medium text-[var(--dark-gray)] hover:border-[var(--light-blue)] hover:text-[var(--light-blue)] transition-colors">
            Bíblia
          </Link>
          <Link href="/devotionals" className="p-4 rounded-xl border border-[var(--medium-gray)] bg-[var(--white)] text-center text-sm font-medium text-[var(--dark-gray)] hover:border-[var(--light-blue)] hover:text-[var(--light-blue)] transition-colors">
            Devocionais
          </Link>
          <Link href="/about" className="p-4 rounded-xl border border-[var(--medium-gray)] bg-[var(--white)] text-center text-sm font-medium text-[var(--dark-gray)] hover:border-[var(--light-blue)] hover:text-[var(--light-blue)] transition-colors">
            Sobre
          </Link>
          <Link href="/login" className="p-4 rounded-xl border border-[var(--medium-gray)] bg-[var(--white)] text-center text-sm font-medium text-[var(--dark-gray)] hover:border-[var(--light-blue)] hover:text-[var(--light-blue)] transition-colors">
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
