import {
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Location, NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { GearService } from '../../core/services/gear.service';
import { SeoService } from '../../core/services/seo.service';
import type { GearItem } from '../../core/models';
import { SortMenu, type SortOption } from '../../shared/components/sort-menu/sort-menu';
import { GearCard } from '../../shared/components/gear-card/gear-card';
import { GearQuickView } from '../../shared/components/gear-quick-view/gear-quick-view';
import {
  GearSearch,
  matchesGear,
  type GearGroupPick,
} from '../../shared/components/gear-search/gear-search';

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'discount';

interface GearSection {
  key: string;
  label: string;
  items: GearItem[];
  /** Group slug to filter on when the user picks "Only …". */
  groupSlug: string | null;
}

const HERO_INTERVAL_MS = 4200;

const HERO_WORDS: Record<string, string> = {
  cameras: 'camera',
  lenses: 'lens',
  lighting: 'light',
  audio: 'mic',
  monitors: 'monitor',
  gimbals: 'gimbal',
};

const SORTS: SortOption[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'discount', label: 'Biggest discount' },
];

@Component({
  selector: 'app-cameras',
  imports: [RouterLink, NgTemplateOutlet, SortMenu, GearCard, GearQuickView, GearSearch],
  templateUrl: './cameras.html',
  styleUrl: './cameras.css',
})
export class Cameras implements OnInit {
  private readonly gear = inject(GearService);
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);

  private readonly track = viewChild<ElementRef<HTMLElement>>('track');
  private readonly results$ = viewChild<ElementRef<HTMLElement>>('resultsTop');

  readonly categories = this.gear.categories;
  readonly totalItems = this.gear.items.length;
  readonly brandCount = this.gear.brandCount;
  readonly sorts = SORTS;
  /** Hand-picked products with the strongest studio photos for the hero grid. */
  readonly featured = [
    'sony-fx6',
    'sony-fe-70-200-2-8-gm-v2',
    'aputure-ls-600d-pro',
    'dji-mic-wireless-microphone',
    'lilliput-a7s7-field-monitor',
  ]
    .map((slug) => this.gear.bySlug(slug))
    .filter((g): g is GearItem => g !== null);
  readonly quickSearches = ['Sony', 'Aputure', 'DJI', 'Godox', 'Wireless mic', 'ND filter'];

  /** Word in the headline that rolls with the product on stage. */
  readonly heroWords = this.featured.map((g) => HERO_WORDS[g.categoryKey] ?? 'gear');
  readonly heroIndex = signal(0);
  readonly heroPaused = signal(false);
  readonly heroItem = computed(() => this.featured[this.heroIndex()] ?? null);
  readonly heroIntervalMs = HERO_INTERVAL_MS;
  readonly brands = [
    ...new Set(this.gear.items.filter((g) => g.isBrand).map((g) => g.group)),
  ];

  readonly activeCat = signal(this.categories[0]?.key ?? '');
  readonly activeGroup = signal<string | null>(null);
  readonly query = signal('');
  readonly sort = signal<SortKey>('featured');
  readonly activeItem = signal<GearItem | null>(null);

  readonly canScrollPrev = signal(false);
  readonly canScrollNext = signal(false);

  readonly category = computed(
    () => this.gear.category(this.activeCat()) ?? this.categories[0],
  );
  readonly isSearching = computed(() => this.query().trim().length > 0);

  readonly results = computed(() => {
    let list: GearItem[];
    if (this.isSearching()) {
      list = this.gear.items.filter((g) => matchesGear(g, this.query()));
    } else {
      list = this.gear.items.filter((g) => g.categoryKey === this.activeCat());
      const group = this.activeGroup();
      if (group) list = list.filter((g) => g.groupSlug === group);
    }
    return this.sorted(list);
  });

  readonly sections = computed<GearSection[]>(() => {
    const list = this.results();
    if (this.isSearching()) {
      return this.categories
        .map((c) => ({
          key: c.key,
          label: c.label,
          items: list.filter((g) => g.categoryKey === c.key),
          groupSlug: null,
        }))
        .filter((s) => s.items.length);
    }
    const group = this.activeGroup();
    if (group) {
      const label = this.category().groups.find((g) => g.slug === group)?.label ?? '';
      return [{ key: group, label, items: list, groupSlug: null }];
    }
    return this.category()
      .groups.map((g) => ({
        key: g.slug,
        label: g.label,
        items: list.filter((item) => item.groupSlug === g.slug),
        groupSlug: g.slug,
      }))
      .filter((s) => s.items.length);
  });

  readonly groupNoun = computed(() =>
    this.category().groups.every((g) => g.isBrand) ? 'brands' : 'groups',
  );

  constructor() {
    afterNextRender(() => {
      this.revealActiveCategory('instant');
      this.setupCategoryScroller();
      this.startHeroRotation();
    });
  }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const item = this.gear.bySlug(params.get('item') ?? '');
    const cat = params.get('cat');
    if (cat && this.gear.category(cat)) this.activeCat.set(cat);
    else if (item) this.activeCat.set(item.categoryKey);
    const brand = params.get('brand');
    if (brand && this.category().groups.some((g) => g.slug === brand)) this.activeGroup.set(brand);
    const q = params.get('q');
    if (q) this.query.set(q);
    const sort = params.get('sort') as SortKey | null;
    if (sort && SORTS.some((s) => s.value === sort)) this.sort.set(sort);
    if (item) this.activeItem.set(item);

    this.seo.setPage({
      title: 'Rent cameras, lenses, lighting & gear',
      description: `Browse ${this.totalItems} rentable items including cameras, lenses, lighting, gimbals, audio, monitors, filters, tripods, studio and grip from ${this.brandCount} brands.`,
      path: '/cameras',
    });
  }

  setCategory(key: string): void {
    this.activeCat.set(key);
    this.activeGroup.set(null);
    this.query.set('');
    this.syncUrl();
    setTimeout(() => this.revealActiveCategory('smooth'));
  }

  setGroup(slug: string | null): void {
    this.activeGroup.set(slug);
    this.syncUrl();
  }

  onSearch(term: string): void {
    this.query.set(term);
    this.syncUrl();
    if (term) this.scrollToResults();
  }

  onGroupPick(pick: GearGroupPick): void {
    this.query.set('');
    this.activeCat.set(pick.categoryKey);
    this.activeGroup.set(pick.groupSlug);
    this.syncUrl();
    setTimeout(() => this.revealActiveCategory('smooth'));
    this.scrollToResults();
  }

  setSort(value: string): void {
    this.sort.set(value as SortKey);
    this.syncUrl();
  }

  openItem(item: GearItem): void {
    this.activeItem.set(item);
    this.syncUrl();
  }

  closeItem(): void {
    this.activeItem.set(null);
    this.syncUrl();
  }

  setHero(index: number): void {
    this.heroIndex.set(index);
    this.heroTick = 0;
  }

  private heroTick = 0;

  /** Advances the spotlight; pauses on hover, in hidden tabs and for reduced motion. */
  private startHeroRotation(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const stepMs = 100;
    const id = window.setInterval(() => {
      if (this.heroPaused() || document.hidden || this.activeItem()) return;
      this.heroTick += stepMs;
      if (this.heroTick >= HERO_INTERVAL_MS) {
        this.heroTick = 0;
        this.heroIndex.set((this.heroIndex() + 1) % this.featured.length);
      }
    }, stepMs);
    this.destroyRef.onDestroy(() => window.clearInterval(id));
  }

  scrollCategories(direction: 1 | -1): void {
    const el = this.track()?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: 'smooth' });
  }

  private sorted(list: GearItem[]): GearItem[] {
    const copy = [...list];
    switch (this.sort()) {
      case 'price-asc':
        return copy.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return copy.sort((a, b) => b.price - a.price);
      case 'rating':
        return copy.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
      case 'discount':
        return copy.sort((a, b) => b.discount - a.discount);
      default:
        return copy;
    }
  }

  private scrollToResults(): void {
    setTimeout(() => {
      const el = this.results$()?.nativeElement;
      if (!el) return;
      const offset = 150;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      if (top < window.scrollY || top > window.scrollY + window.innerHeight * 0.5) {
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  }

  /** Scrolls only the category bar (never the page) so the active tab is visible. */
  private revealActiveCategory(behavior: ScrollBehavior): void {
    const el = this.track()?.nativeElement;
    const active = el?.querySelector<HTMLElement>('.gp-cat.is-on');
    if (!el || !active) return;
    const left = active.offsetLeft - (el.clientWidth - active.offsetWidth) / 2;
    el.scrollTo({ left: Math.max(0, left), behavior });
  }

  /**
   * Arrow visibility, plus vertical mouse wheel and click-drag scrolling for
   * mice without horizontal scroll.
   */
  private setupCategoryScroller(): void {
    const el = this.track()?.nativeElement;
    if (!el) return;

    const update = () => {
      this.canScrollPrev.set(el.scrollLeft > 4);
      this.canScrollNext.set(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const max = el.scrollWidth - el.clientWidth;
      const atStart = el.scrollLeft <= 0 && e.deltaY < 0;
      const atEnd = el.scrollLeft >= max - 1 && e.deltaY > 0;
      if (max <= 0 || atStart || atEnd) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    let startX = 0;
    let startLeft = 0;
    let dragging = false;
    let moved = false;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) {
        moved = true;
        el.classList.add('is-dragging');
        el.setPointerCapture(e.pointerId);
      }
      if (moved) el.scrollLeft = startLeft - dx;
    };
    const onUp = () => {
      dragging = false;
      el.classList.remove('is-dragging');
    };
    const onClickCapture = (e: MouseEvent) => {
      if (moved) {
        e.stopPropagation();
        e.preventDefault();
        moved = false;
      }
    };

    el.addEventListener('scroll', update, { passive: true });
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('click', onClickCapture, true);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();

    this.destroyRef.onDestroy(() => {
      el.removeEventListener('scroll', update);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('click', onClickCapture, true);
      ro.disconnect();
    });
  }

  /** Keeps filters shareable without a router navigation (which would scroll to top). */
  private syncUrl(): void {
    const searching = this.isSearching();
    const tree = this.router.createUrlTree([], {
      relativeTo: this.route,
      queryParams: {
        cat: this.activeCat(),
        brand: searching ? null : this.activeGroup(),
        q: searching ? this.query().trim() : null,
        sort: this.sort() === 'featured' ? null : this.sort(),
        item: this.activeItem()?.slug ?? null,
      },
    });
    this.location.replaceState(this.router.serializeUrl(tree));
  }
}
