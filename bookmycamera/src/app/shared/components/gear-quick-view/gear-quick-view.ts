import {
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { GearService } from '../../../core/services/gear.service';
import type { GearItem } from '../../../core/models';

/** Icons for common specification labels (24×24 stroke paths). */
const SPEC_ICONS: Array<[RegExp, string]> = [
  [/sensor|resolution|megapixel/i, 'M6 6h12v12H6zM9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4'],
  [/video|frame|fps|record/i, 'M3 7h12v10H3zM15 10l6-3v10l-6-3'],
  [/iso|light|lux|brightness|output/i, 'M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
  [/battery|power|runtime/i, 'M3 8h15v8H3zM21 11v2M6 11v2M9 11v2'],
  [/focal|zoom|length/i, 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
  [/aperture|f\//i, 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM14.3 8l5.7 9.9M9.7 8h11.4M7.4 12l5.7-9.9M9.7 16L4 6.1M14.3 16H2.9M16.6 12l-5.7 9.9'],
  [/mount|connect|port|input/i, 'M8 3v4M16 3v4M6 7h12v5a6 6 0 0 1-12 0zM12 18v3'],
  [/weight|load|payload/i, 'M6 8h12l2 12H4zM9 8a3 3 0 0 1 6 0'],
  [/size|dimension|diameter|length|range/i, 'M4 20L20 4M4 20v-5M4 20h5M20 4v5M20 4h-5'],
  [/color|cct|temperature/i, 'M12 3a9 9 0 1 0 0 18c1 0 1.5-.8 1.5-1.5 0-1.2-1-1.5-1-2.5s.8-1.5 2-1.5H17a4 4 0 0 0 4-4c0-4.4-4-8.5-9-8.5z'],
];
const SPEC_FALLBACK = 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8v4l3 2';

@Component({
  selector: 'app-gear-quick-view',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './gear-quick-view.html',
  styleUrl: './gear-quick-view.css',
})
export class GearQuickView implements OnDestroy {
  private readonly gear = inject(GearService);

  readonly item = input<GearItem | null>(null);
  readonly closed = output<void>();
  readonly selected = output<GearItem>();

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly body = viewChild<ElementRef<HTMLElement>>('body');

  /** Only camera bodies can be pre-selected in the booking flow. */
  readonly bookable = computed(() => this.item()?.categoryKey === 'cameras');
  readonly savings = computed(() => {
    const g = this.item();
    return g && g.originalPrice > g.price ? g.originalPrice - g.price : 0;
  });
  readonly rails = computed(() => {
    const g = this.item();
    if (!g) return [];
    return [
      { id: 'qv-related', title: `More ${g.categoryLabel.toLowerCase()}`, list: this.gear.related(g, 6) },
      { id: 'qv-pairs', title: 'Pairs well with', list: this.gear.pairsWith(g, 6) },
    ];
  });

  constructor() {
    effect(() => {
      const el = this.dialog().nativeElement;
      const current = this.item();
      if (current && !el.open) {
        el.showModal();
        document.documentElement.classList.add('bmc-scroll-lock');
      } else if (!current && el.open) {
        el.close();
      }
      if (current) this.body()?.nativeElement.scrollTo({ top: 0 });
    });
  }

  ngOnDestroy(): void {
    document.documentElement.classList.remove('bmc-scroll-lock');
  }

  /** Esc key — handled here so cleanup never depends on the async `close` event. */
  onCancel(event: Event): void {
    event.preventDefault();
    this.close();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.close();
  }

  specIcon(label: string): string {
    return SPEC_ICONS.find(([re]) => re.test(label))?.[1] ?? SPEC_FALLBACK;
  }

  close(): void {
    const el = this.dialog().nativeElement;
    if (el.open) el.close();
    this.finish();
  }

  /** Idempotent: runs for the close button, backdrop, Esc and the native `close` event. */
  finish(): void {
    document.documentElement.classList.remove('bmc-scroll-lock');
    if (this.item()) this.closed.emit();
  }
}
