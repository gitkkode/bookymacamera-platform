import {
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

export interface SortOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-sort-menu',
  templateUrl: './sort-menu.html',
  styleUrl: './sort-menu.css',
})
export class SortMenu {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly options = input.required<SortOption[]>();
  readonly value = input.required<string>();
  readonly changed = output<string>();

  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  readonly open = signal(false);
  readonly active = signal(0);
  readonly current = computed(
    () => this.options().find((o) => o.value === this.value()) ?? this.options()[0],
  );

  toggle(): void {
    if (this.open()) this.close();
    else this.show();
  }

  pick(option: SortOption): void {
    this.changed.emit(option.value);
    this.close();
    this.trigger().nativeElement.focus({ preventScroll: true });
  }

  onKeydown(event: KeyboardEvent): void {
    const count = this.options().length;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.open()) this.show();
        else this.active.set((this.active() + 1) % count);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.open()) this.show();
        else this.active.set((this.active() - 1 + count) % count);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.open()) this.pick(this.options()[this.active()]);
        else this.show();
        break;
      case 'Escape':
        if (this.open()) {
          event.preventDefault();
          this.close();
        }
        break;
      case 'Tab':
        this.close();
        break;
    }
  }

  private show(): void {
    this.active.set(Math.max(0, this.options().findIndex((o) => o.value === this.value())));
    this.open.set(true);
  }

  private close(): void {
    this.open.set(false);
  }

  @HostListener('document:pointerdown', ['$event'])
  onDocumentPointer(event: PointerEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) this.close();
  }
}
