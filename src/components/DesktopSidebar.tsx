'use client';

import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import BrandLogo from './BrandLogo';

const menuItems = [
  { label: 'Home', href: '/' },
  { label: 'Devotionals', href: '/devotionals' },
  { label: 'Bible', href: '/bible' },
  { label: 'About', href: '/about' },
];

const authItems = [
  { label: 'SignUp', href: '/signup' },
  { label: 'Login', href: '/login' },
];

export default function DesktopSidebar() {
  return (
    <aside className="hidden md:flex md:w-64 md:flex-shrink-0 md:flex-col md:border-r md:border-[var(--medium-gray)] bg-[var(--white)] overflow-y-auto">
      <div className="h-16 flex items-center justify-center mt-6 p-[10px]">
        <Link href="/" className="w-[150px]">
          <BrandLogo />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 mt-6">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block px-4 py-3 rounded-lg transition-colors duration-200 text-[var(--dark-gray)] hover:bg-[var(--medium-gray)]"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-4 py-4 border-t border-[var(--medium-gray)] space-y-2">
        {authItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-4 py-2 rounded-lg text-center text-white transition-opacity duration-200 ${item.label === 'SignUp' ? 'bg-[var(--light-blue)] hover:opacity-90' : 'bg-[var(--dark-gray)] hover:opacity-90'
              }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-[var(--medium-gray)] flex justify-center">
        <ThemeToggle />
      </div>
    </aside>
  );
}
