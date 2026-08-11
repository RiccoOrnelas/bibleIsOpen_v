'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-3 bg-[var(--white)]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center gap-0.5 text-center">
          <p className="text-sm text-[var(--dark-gray)]">Bible Is Open — Sua ferramenta de fé e edificação diária</p>
          <div className="flex items-center justify-between w-full text-xs">
            <p className="text-[var(--dark-gray)]/50">© {currentYear} Bible Is Open</p>
            <div className="flex gap-4">
              <Link href="/privacy" className="text-[var(--dark-gray)]/60 hover:text-[var(--light-blue)] transition-colors">Privacidade</Link>
              <Link href="/terms" className="text-[var(--dark-gray)]/60 hover:text-[var(--light-blue)] transition-colors">Termos</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
