'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function BrandLogo() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-8" />;
  }

  const logoSrc = theme === 'dark' ? '/2.png' : '/1.png';

  return (
    <Image
      src={logoSrc}
      alt="Bible Is Open"
      width={0}
      height={0}
      sizes="100vw"
      className="w-full h-auto"
      priority
    />
  );
}
