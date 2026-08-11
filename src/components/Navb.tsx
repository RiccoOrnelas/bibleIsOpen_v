'use client';

import Link from 'next/link';

export default function Nav_botton() {
    return (
        <div className='bg-[var(--white)] border-t border-[var(--medium-gray)] h-18 flex items-center justify-center md:hidden'>
            <ul className="space-y-2 flex items-center justify-center gap-5">
                {[
                    { label: 'Home', href: '/' },
                    { label: 'Devotionals', href: '/devotionals' },
                    { label: 'Bible', href: '/bible' },
                    { label: 'About', href: '/about' },
                ].map((item) => (
                    <li key={item.href}>
                        <Link href={item.href} className="text-sm text-[var(--dark-gray)] transition-colors duration-200 hover:text-[var(--light-blue)]">
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}