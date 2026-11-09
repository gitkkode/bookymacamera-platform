import { Injectable } from '@angular/core';

import { GEAR, GEAR_BRAND_COUNT, GEAR_CATEGORIES } from '../data/catalogue';
import type { GearCategory, GearItem } from '../models';

/** Pairings used for "Pairs well with" on the detail page. */
const PAIRS_WITH: Record<string, string[]> = {
  cameras: ['lenses', 'gimbals', 'monitors'],
  combos: ['gimbals', 'audio', 'monitors'],
  lenses: ['cameras', 'filters'],
  lighting: ['grip', 'support'],
  gimbals: ['cameras', 'monitors'],
  audio: ['cameras', 'monitors'],
  monitors: ['cameras', 'gimbals'],
  filters: ['lenses', 'cameras'],
  support: ['cameras', 'gimbals'],
  studio: ['lighting', 'grip'],
  grip: ['lighting', 'support'],
};

@Injectable({ providedIn: 'root' })
export class GearService {
  readonly items: readonly GearItem[] = GEAR;
  readonly categories: readonly GearCategory[] = GEAR_CATEGORIES;
  readonly brandCount = GEAR_BRAND_COUNT;

  bySlug(slug: string): GearItem | null {
    const normalized = slug?.trim().toLowerCase() ?? '';
    return this.items.find((g) => g.slug === normalized) ?? null;
  }

  category(key: string): GearCategory | null {
    return this.categories.find((c) => c.key === key) ?? null;
  }

  /** Same category, same brand/group first, then the rest of the category. */
  related(item: GearItem, limit = 4): GearItem[] {
    const sameCategory = this.items.filter(
      (g) => g.categoryKey === item.categoryKey && g.key !== item.key,
    );
    const sameGroup = sameCategory.filter((g) => g.groupSlug === item.groupSlug);
    const rest = sameCategory.filter((g) => g.groupSlug !== item.groupSlug);
    return [...sameGroup, ...rest].slice(0, limit);
  }

  /** Complementary gear, preferring the same brand (e.g. Sony lenses for a Sony body). */
  pairsWith(item: GearItem, limit = 4): GearItem[] {
    const targets = PAIRS_WITH[item.categoryKey] ?? [];
    const pool = this.items.filter((g) => targets.includes(g.categoryKey));
    const sameBrand = item.isBrand ? pool.filter((g) => g.group === item.group) : [];
    const picked: GearItem[] = [...sameBrand];
    for (const target of targets) {
      for (const g of pool) {
        if (picked.length >= limit * 2) break;
        if (g.categoryKey === target && !picked.includes(g)) picked.push(g);
      }
    }
    return picked.slice(0, limit);
  }
}
