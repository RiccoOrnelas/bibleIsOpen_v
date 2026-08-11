'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function CollapsedLogo() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="w-11 h-11" />;

  return (
    <Image
      src={theme === 'dark' ? '/4.png' : '/3.png'}
      alt="Bible Is Open"
      width={44}
      height={44}
      quality={100}
      className="w-11 h-11 object-contain"
    />
  );
}
