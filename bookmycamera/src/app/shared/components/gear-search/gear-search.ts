import {
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { GearService } from '../../../core/services/gear.service';
import type { GearItem } from '../../../core/models';

export interface GearGroupPick {
  categoryKey: string;
  groupSlug: string | null;
}

interface GroupOption {
  kind: 'group';
  id: string;
  label: string;
  context: string;
  count: number;
  pick: GearGroupPick;
}

interface ItemOption {
  kind: 'item';
  id: string;
  item: GearItem;
}

interface AllOption {
  kind: 'all';
  id: string;
}

type Option = GroupOption | ItemOption | AllOption;

export interface TextPart {
  text: string;
  match: boolean;
}

const POPULAR = ['Sony', 'Aputure', 'Godox', 'Wireless mic', 'ND filter', 'Gimbal'];

/** Matches every whitespace-separated term against an item's searchable text. */
export const matchesGear = (item: GearItem, query: string): boolean => {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return false;
  const haystack = [item.name, item.group, item.categoryLabel, ...item.specifications.map((s) => s.value)]
    .join(' ')
    .toLowerCase();
  return terms.every((t) => haystack.includes(t));
};

@Component({
  selector: 'app-gear-search',
  imports: [DecimalPipe],
  templateUrl: './gear-search.html',
  styleUrl: './gear-search.css',
})
export class GearSearch {
  private readonly gear = inject(GearService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Query currently applied to the page (keeps the box in sync when cleared elsewhere). */
  readonly value = input('');
  readonly searched = output<string>();
  readonly picked = output<GearItem>();
  readonly groupPicked = output<GearGroupPick>();

  private readonly inputEl = viewChild.required<ElementRef<HTMLInputElement>>('field');

  readonly text = signal('');
  readonly open = signal(false);
  readonly active = signal(-1);
  readonly popular = POPULAR;

  private readonly q = computed(() => this.text().trim().toLowerCase());

  readonly groupOptions = computed<GroupOption[]>(() => {
    const q = this.q();
    if (!q) return [];
    const out: GroupOption[] = [];
    for (const cat of this.gear.categories) {
      if (cat.label.toLowerCase().includes(q)) {
        out.push({
          kind: 'group',
          id: `cat-${cat.key}`,
          label: cat.label,
          context: 'Category',
          count: cat.count,
          pick: { categoryKey: cat.key, groupSlug: null },
        });
      }
      for (const g of cat.groups) {
        if (g.label.toLowerCase().includes(q)) {
          out.push({
            kind: 'group',
            id: `grp-${cat.key}-${g.slug}`,
            label: g.label,
            context: `in ${cat.label}`,
            count: g.count,
            pick: { categoryKey: cat.key, groupSlug: g.slug },
          });
        }
      }
    }
    return out.sort((a, b) => b.count - a.count).slice(0, 4);
  });

  readonly matches = computed(() => {
    const q = this.q();
    return q ? this.gear.items.filter((g) => matchesGear(g, q)) : [];
  });

  readonly itemOptions = computed<ItemOption[]>(() => {
    const q = this.q();
    const score = (g: GearItem) => {
      const name = g.name.toLowerCase();
      if (name.startsWith(q)) return 3;
      if (name.split(/\s+/).some((w) => w.startsWith(q))) return 2;
      return name.includes(q) ? 1 : 0;
    };
    return [...this.matches()]
      .sort((a, b) => score(b) - score(a) || b.rating - a.rating)
      .slice(0, 6)
      .map((item) => ({ kind: 'item' as const, id: `item-${item.key}`, item }));
  });

  readonly options = computed<Option[]>(() => {
    const list: Option[] = [...this.groupOptions(), ...this.itemOptions()];
    if (this.matches().length) list.push({ kind: 'all', id: 'all' });
    return list;
  });

  readonly activeId = computed(() => {
    const opt = this.options()[this.active()];
    return opt ? `gs-${opt.id}` : null;
  });

  constructor() {
    effect(() => this.text.set(this.value()));
  }

  indexOf(id: string): number {
    return this.options().findIndex((o) => o.id === id);
  }

  parts(text: string): TextPart[] {
    const q = this.q();
    const i = q ? text.toLowerCase().indexOf(q) : -1;
    if (i < 0) return [{ text, match: false }];
    return [
      { text: text.slice(0, i), match: false },
      { text: text.slice(i, i + q.length), match: true },
      { text: text.slice(i + q.length), match: false },
    ].filter((p) => p.text);
  }

  onInput(value: string): void {
    this.text.set(value);
    this.open.set(true);
    this.active.set(-1);
  }

  onKeydown(event: KeyboardEvent): void {
    const count = this.options().length;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.open.set(true);
        if (count) this.active.set((this.active() + 1) % count);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (count) this.active.set((this.active() - 1 + count) % count);
        break;
      case 'Enter': {
        event.preventDefault();
        const opt = this.options()[this.active()];
        if (opt) this.choose(opt);
        else this.submit();
        break;
      }
      case 'Escape':
        if (this.open()) {
          event.preventDefault();
          this.open.set(false);
        } else if (this.text()) {
          this.clear();
        }
        break;
    }
  }

  choose(opt: Option): void {
    if (opt.kind === 'item') {
      this.picked.emit(opt.item);
    } else if (opt.kind === 'group') {
      this.text.set('');
      this.groupPicked.emit(opt.pick);
    } else {
      this.submit();
      return;
    }
    this.close();
  }

  usePopular(term: string): void {
    this.text.set(term);
    this.submit();
  }

  submit(): void {
    this.searched.emit(this.text().trim());
    this.close();
  }

  clear(): void {
    this.text.set('');
    this.searched.emit('');
    this.inputEl().nativeElement.focus();
  }

  private close(): void {
    this.open.set(false);
    this.active.set(-1);
    this.inputEl().nativeElement.blur();
  }

  @HostListener('document:pointerdown', ['$event'])
  onDocumentPointer(event: PointerEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  /** "/" focuses search from anywhere on the page, like most catalogue sites. */
  @HostListener('document:keydown', ['$event'])
  onDocumentKey(event: KeyboardEvent): void {
    if (event.key !== '/' || event.metaKey || event.ctrlKey) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('input, textarea, select, [contenteditable="true"], dialog[open]')) return;
    event.preventDefault();
    this.inputEl().nativeElement.focus();
    this.open.set(true);
  }
}
