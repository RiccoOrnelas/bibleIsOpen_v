'use client';

import { useState } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import BrandLogo from './BrandLogo';

const menuItems = [
  { label: 'Home', href: '/' },
  { label: 'Devotionals', href: '/devotionals' },
  { label: 'Bible', href: '/bible' },
  { label: 'Meditação', href: '/meditation' },
  { label: 'About', href: '/about' },
];

const authItems = [
  { label: 'SignUp', href: '/signup' },
  { label: 'Login', href: '/login' },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen((s) => !s);

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 z-50 bg-[var(--white)]">
        <Link href="/" className=" flex-shrink-0 w-48 sm:w-60">
          <BrandLogo />
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={toggleMobileMenu}
            className="flex flex-col gap-1.5 p-2 rounded focus:outline-none"
            aria-label="Toggle menu"
          >
            <span className="w-6 h-0.5 block bg-[var(--dark-gray)]"></span>
            <span className="w-6 h-0.5 block bg-[var(--dark-gray)]"></span>
            <span className="w-6 h-0.5 block bg-[var(--dark-gray)]"></span>
          </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <nav
        className={`fixed left-0 top-16 bottom-0 w-64 flex flex-col md:hidden z-50 transform transition-transform duration-300 bg-[var(--white)] ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <ul className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="block px-4 py-3 rounded-lg transition-colors duration-200 text-[var(--dark-gray)] hover:bg-[var(--medium-gray)]" onClick={() => setIsMobileMenuOpen(false)}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="px-4 py-4 space-y-2">
          {authItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-lg text-center text-white transition-opacity duration-200 ${item.label === 'SignUp' ? 'bg-[var(--light-blue)] hover:opacity-90' : 'bg-[var(--dark-gray)] hover:opacity-90'
                }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
