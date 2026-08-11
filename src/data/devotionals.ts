import type { Devotional } from '@/types/devotional';
import devotionalsData from '../../devotionals.json';

export type { Devotional };

export const devotionals: Devotional[] = devotionalsData as Devotional[];

export function getDevotional(index: number): Devotional | undefined {
  return devotionals[index];
}

export function getRelated(theme: string, excludeIndex: number, limit = 4): Devotional[] {
  return devotionals
    .filter((d, i) => d.theme === theme && i !== excludeIndex)
    .slice(0, limit);
}
