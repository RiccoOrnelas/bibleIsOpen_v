'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-8 border-t bg-[var(--white)] border-[var(--medium-gray)]">
      <div className="max-w-6xl mx-auto px-4">


        <div className="mt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-[var(--dark-gray)]"> Bible is Open. Sua ferramenta de fé e edificão diária</p>
          <p className="text-sm mb-4 md:mb-0 text-[var(--medium-gray)]">© {currentYear} Bible Is Open. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-[var(--dark-gray)] transition-colors duration-200 hover:text-[var(--light-blue)]">Privacidade</Link>
            <Link href="/terms" className="text-sm text-[var(--dark-gray)] transition-colors duration-200 hover:text-[var(--light-blue)]">Termos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
