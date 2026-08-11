'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { parseDevotionalBody, renderFormattedText } from '@/lib/parseDevotional';
import { devotionals, getRelated } from '@/data/devotionals';

function stripBold(text: string): string {
  return text.replace(/\*\*/g, '');
}

function ViewerContent() {
  const searchParams = useSearchParams();
  const index = Number(searchParams.get('i'));

  if (isNaN(index) || index < 0 || index >= devotionals.length) {
    return (
      <main className="p-8 text-center">
        <h1 className="text-2xl font-bold text-[var(--dark-gray)]">Devocional não encontrado</h1>
        <Link href="/devotionals" className="text-[var(--light-blue)] hover:underline mt-4 inline-block">
          Voltar para Devotionals
        </Link>
      </main>
    );
  }

  const devotional = devotionals[index];
  const parsed = parseDevotionalBody(devotional.body);

  const related = getRelated(devotional.theme, index);

  return (
    <main className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <Link
        href="/devotionals"
        className="inline-flex items-center gap-1 text-sm text-[var(--light-blue)] hover:underline mb-6"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Voltar
      </Link>

      <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-[var(--light-blue)]/20 text-[var(--light-blue)] mb-4">
        {devotional.theme}
      </span>

      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--dark-gray)] leading-tight mb-6">
        {devotional.title}
      </h1>

      <div className="flex items-center gap-3 text-sm text-[var(--dark-gray)]/60 mb-8 pb-6 border-b border-[var(--medium-gray)]">
        <span>{devotional.author}</span>
        {devotional.biblical_text && (
          <>
            <span className="text-[var(--medium-gray)]">|</span>
            <span className="text-[var(--light-blue)] font-medium">{devotional.biblical_text}</span>
          </>
        )}
      </div>

      {/* Biblical Quote */}
      {parsed.biblicalQuote && (
        <blockquote className="border-l-4 border-[var(--light-blue)] pl-4 italic text-[var(--dark-gray)]/80 mb-8 leading-relaxed">
          {parsed.biblicalQuote}
        </blockquote>
      )}

      {parsed.reference && (
        <p className="text-sm font-semibold text-[var(--light-blue)] mb-6">
          {stripBold(parsed.reference)}
        </p>
      )}

      {/* Exposition */}
      <div className="space-y-4 text-[var(--dark-gray)] leading-relaxed text-base">
        {parsed.paragraphs.map((p, i) => {
          if (p.type === 'separator') {
            return <hr key={i} className="border-[var(--medium-gray)] my-6" />;
          }
          if (p.type === 'subtitle') {
            return (
              <h2 key={i} className="text-lg font-bold text-[var(--dark-gray)] mt-8 mb-2">
                {p.text}
              </h2>
            );
          }
          return (
            <p key={i}>
              {renderFormattedText(p.text)}
            </p>
          );
        })}
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-12 pt-8 border-t border-[var(--medium-gray)]">
          <h2 className="text-lg font-bold text-[var(--dark-gray)] mb-4">
            Mais sobre {devotional.theme}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {related.map((d) => (
              <Link
                key={devotionals.indexOf(d)}
                href={`/devotionals/viewer?i=${devotionals.indexOf(d)}`}
                className="block p-4 rounded-xl border border-[var(--medium-gray)] bg-[var(--white)] hover:border-[var(--light-blue)] transition-colors group"
              >
                <h3 className="text-sm font-semibold text-[var(--dark-gray)] group-hover:text-[var(--light-blue)] transition-colors line-clamp-2">
                  {d.title}
                </h3>
                <p className="text-xs text-[var(--dark-gray)]/50 mt-1">{d.biblical_text}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

export default function ViewerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[var(--dark-gray)]">Carregando...</div>}>
      <ViewerContent />
    </Suspense>
  );
}
