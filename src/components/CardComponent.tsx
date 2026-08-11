import Link from 'next/link';
import Image from 'next/image';
import type { Devotional } from '@/types/devotional';

function getSnippet(body: string, maxLen = 140): string {
  const plain = body.replace(/\*\*/g, '').replace(/\n/g, ' ').trim();
  return plain.length > maxLen ? plain.slice(0, maxLen) + '...' : plain;
}

export default function CardComponent({ devotional, index }: { devotional: Devotional; index: number }) {
  const snippet = getSnippet(devotional.body);

  const cardContent = (
    <article className="group rounded-2xl overflow-hidden border border-[var(--medium-gray)] bg-[var(--white)] transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col h-full cursor-pointer">
      <div className="relative w-full aspect-[3/2] overflow-hidden">
        <Image
          src={devotional.img}
          alt={devotional.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      <div className="flex flex-col flex-1 p-5">
        <span className="inline-block self-start text-xs font-medium px-3 py-1 rounded-full bg-[var(--light-blue)]/20 text-[var(--light-blue)] mb-3">
          {devotional.theme}
        </span>

        <h2 className="text-lg font-bold text-[var(--dark-gray)] leading-snug mb-2 line-clamp-2 group-hover:text-[var(--light-blue)] transition-colors">
          {devotional.title}
        </h2>

        <p className="text-sm text-[var(--dark-gray)]/70 leading-relaxed flex-1 line-clamp-3">
          {snippet}
        </p>

        <div className="mt-4 pt-3 border-t border-[var(--medium-gray)] flex items-center justify-between text-xs text-[var(--dark-gray)]/60">
          <span>{devotional.author}</span>
          <span className="font-medium text-[var(--light-blue)]">{devotional.biblical_text}</span>
        </div>
      </div>
    </article>
  );

  return <Link href={`/devotionals/viewer?i=${index}`}>{cardContent}</Link>;
}
