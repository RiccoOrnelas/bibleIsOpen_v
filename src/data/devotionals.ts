import type { Devotional } from '@/types/devotional';
import devotionalsData from '../../devotionals.json';

export type { Devotional };

export const DEVOTIONAL_PLACEHOLDER = '/devotional-placeholder.svg';

export function getDevotionalImage(image?: string): string {
  const value = image?.trim();

  return value && !value.includes('placehold.co') ? value : DEVOTIONAL_PLACEHOLDER;
}

export const devotionals: Devotional[] = (devotionalsData as Devotional[]).map((devotional) => ({
  ...devotional,
  img: getDevotionalImage(devotional.img),
}));

export function getDevotional(index: number): Devotional | undefined {
  return devotionals[index];
}

export function getRelated(theme: string, excludeIndex: number, limit = 4): Devotional[] {
  return devotionals
    .filter((d, i) => d.theme === theme && i !== excludeIndex)
    .slice(0, limit);
}
