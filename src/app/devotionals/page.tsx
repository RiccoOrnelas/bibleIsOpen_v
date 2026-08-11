'use client';

import { useState, useMemo } from 'react';
import CardComponent from '@/components/CardComponent';
import { devotionals, type Devotional } from '@/data/devotionals';

const PER_PAGE_OPTIONS = [20, 30, 40] as const;

function stripMarkdown(text: string): string {
  return text.replace(/\*\*/g, '').replace(/\n/g, ' ').trim();
}

const indexedAll: { devotional: Devotional; originalIndex: number }[] = (
  devotionals
).map((devotional, originalIndex) => ({ devotional, originalIndex }));

export default function DevotionalsPage() {
  const [perPage, setPerPage] = useState<number>(20);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return indexedAll;
    const q = search.toLowerCase();
    return indexedAll.filter(
      ({ devotional: d }) =>
        d.title.toLowerCase().includes(q) ||
        d.theme.toLowerCase().includes(q) ||
        stripMarkdown(d.body).toLowerCase().includes(q) ||
        d.author.toLowerCase().includes(q) ||
        d.biblical_text.toLowerCase().includes(q)
    );
  }, [search]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const safePage = Math.min(page, Math.max(totalPages - 1, 0));

  const paginated = useMemo(() => {
    const start = safePage * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, safePage, perPage]);

  const handlePerPageChange = (value: number) => {
    setPerPage(value);
    setPage(0);
  };

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[var(--dark-gray)]">Devotionals</h1>
          <p className="text-sm text-[var(--dark-gray)]/60 mt-1">
            {filtered.length} devocionais encontrados
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="px-3 py-2 text-sm rounded-lg border border-[var(--medium-gray)] bg-[var(--white)] text-[var(--dark-gray)] placeholder:text-[var(--dark-gray)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--light-blue)] w-40 sm:w-48"
          />

          <select
            value={perPage}
            onChange={(e) => handlePerPageChange(Number(e.target.value))}
            className="px-3 py-2 text-sm rounded-lg border border-[var(--medium-gray)] bg-[var(--white)] text-[var(--dark-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--light-blue)]"
          >
            {PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n} por página</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {paginated.map(({ devotional, originalIndex }) => (
          <CardComponent key={originalIndex} devotional={devotional} index={originalIndex} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-[var(--dark-gray)]/60 py-16">
          Nenhum devocional encontrado.
        </p>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={safePage === 0}
            className="px-4 py-2 text-sm rounded-lg border border-[var(--medium-gray)] bg-[var(--white)] text-[var(--dark-gray)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--medium-gray)] transition-colors"
          >
            Anterior
          </button>

          <span className="text-sm text-[var(--dark-gray)]/70">
            {safePage + 1} de {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            disabled={safePage >= totalPages - 1}
            className="px-4 py-2 text-sm rounded-lg border border-[var(--medium-gray)] bg-[var(--white)] text-[var(--dark-gray)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--medium-gray)] transition-colors"
          >
            Próximo
          </button>
        </div>
      )}
    </main>
  );
}
