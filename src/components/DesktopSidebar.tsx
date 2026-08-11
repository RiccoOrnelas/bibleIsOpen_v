'use client';

import { useState } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import BrandLogo from './BrandLogo';
import CollapsedLogo from './CollapsedLogo';

const menuItems = [
  { label: 'Meditação', href: '/meditation', icon: 'meditate' },
  { label: 'Home', href: '/', icon: 'home' },
  { label: 'Devotionals', href: '/devotionals', icon: 'book' },
  { label: 'Bible', href: '/bible', icon: 'bible' },
  { label: 'About', href: '/about', icon: 'info' },
];

const authItems = [
  { label: 'SignUp', href: '/signup' },
  { label: 'Login', href: '/login' },
];

function SidebarIcon({ name }: { name: string }) {
  const cls = 'w-5 h-5 flex-shrink-0';
  switch (name) {
    case 'meditate':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={cls}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
        </svg>
      );
    case 'home':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={cls}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      );
    case 'book':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={cls}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
      );
    case 'bible':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={cls}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
      );
    case 'info':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={cls}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function DesktopSidebar() {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <aside className={`hidden md:flex md:flex-shrink-0 md:flex-col bg-[var(--white)] overflow-hidden transition-all duration-300 ${collapsed ? 'md:w-20' : 'md:w-64'}`}>
      {/* Logo + Collapse Toggle */}
      <div className={`flex items-center justify-between p-[10px] overflow-hidden mt-6 ${collapsed ? 'flex-col gap-1 justify-center' : ''}`}>
        <Link href="/" className={collapsed ? 'w-10 h-20 flex justify-center' : 'w-[200px]'}>
          {collapsed ? (
            <CollapsedLogo />
          ) : (
            <BrandLogo />
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--light-blue)]/10 hover:bg-[var(--light-blue)]/20 text-[var(--light-blue)] flex items-center justify-center transition-colors"
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px]">
            <rect x="3.75" y="5" width="16.5" height="14" rx="2" />
            <path d="M8.25 5v14" />
          </svg>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-2 py-6 mt-6">
        <ul className="space-y-1">
          {/* Meditação — destaque igual ao mobile */}
          <li>
            <Link
              href="/meditation"
              className={`flex items-center gap-3 rounded-lg transition-colors duration-200 text-[var(--dark-gray)] hover:bg-[var(--medium-gray)] overflow-hidden ${collapsed ? 'justify-center px-0 py-2' : 'px-3 py-2'}`}
              title={collapsed ? 'Meditação' : undefined}
            >
              <span className="flex-shrink-0 w-9 h-9 rounded-full bg-[var(--light-blue)] text-white flex items-center justify-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </span>
              <span className={`text-sm font-semibold whitespace-nowrap transition-opacity duration-200 ${collapsed ? 'w-0 opacity-0' : 'opacity-100'}`}>
                Meditação
              </span>
            </Link>
          </li>

          <li className="my-2" />

          {menuItems.filter(i => i.href !== '/meditation').map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-lg transition-colors duration-200 text-[var(--dark-gray)] hover:bg-[var(--medium-gray)] overflow-hidden ${collapsed ? 'justify-center px-0 py-3' : 'px-3 py-3'}`}
                title={collapsed ? item.label : undefined}
              >
                <SidebarIcon name={item.icon} />
                <span className={`text-sm whitespace-nowrap transition-opacity duration-200 ${collapsed ? 'w-0 opacity-0 hidden' : 'opacity-100'}`}>
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Auth */}
      <div className={`px-2 py-4 space-y-2 transition-opacity duration-200 ${collapsed ? 'opacity-0 pointer-events-none' : ''}`}>
        {authItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-3 py-2 rounded-lg text-center text-white text-sm font-medium transition-opacity duration-200 ${item.label === 'SignUp' ? 'bg-[var(--light-blue)] hover:opacity-90' : 'bg-[var(--dark-gray)] hover:opacity-90'}`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Bottom: theme toggle */}
      <div className="px-2 py-3 flex items-center justify-center">
        <ThemeToggle />
      </div>
    </aside>
  );
}
