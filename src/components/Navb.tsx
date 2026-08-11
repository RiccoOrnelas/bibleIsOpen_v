'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Início', href: '/', icon: 'home' },
  { label: 'Devocionais', href: '/devotionals', icon: 'book' },
];

const navItemsAfter = [
  { label: 'Bíblia', href: '/bible', icon: 'bible' },
  { label: 'Sobre', href: '/about', icon: 'info' },
];

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const cls = active ? 'text-[var(--light-blue)]' : 'text-[var(--dark-gray)]';
  switch (name) {
    case 'home':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${cls}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      );
    case 'book':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${cls}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
      );
    case 'bible':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${cls}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
      );
    case 'info':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${cls}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Nav_botton() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--white)] flex items-center justify-center z-50">
      <ul className="flex items-center justify-around w-full max-w-lg px-2">
        {navItems.slice(0, 2).map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-2 py-1"
            >
              <NavIcon name={item.icon} active={pathname === item.href} />
              <span className={`text-[10px] ${pathname === item.href ? 'text-[var(--light-blue)] font-semibold' : 'text-[var(--dark-gray)]'}`}>
                {item.label}
              </span>
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/meditation"
            className="flex flex-col items-center gap-0.5 px-2 py-1 -mt-5"
          >
            <span className="w-10 h-10 rounded-full bg-[var(--light-blue)] text-white flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </span>
            <span className={`text-[10px] ${pathname === '/meditation' ? 'text-[var(--light-blue)] font-semibold' : 'text-[var(--light-blue)]'}`}>Meditar</span>
          </Link>
        </li>
        {navItemsAfter.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-2 py-1"
            >
              <NavIcon name={item.icon} active={pathname === item.href} />
              <span className={`text-[10px] ${pathname === item.href ? 'text-[var(--light-blue)] font-semibold' : 'text-[var(--dark-gray)]'}`}>
                {item.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
