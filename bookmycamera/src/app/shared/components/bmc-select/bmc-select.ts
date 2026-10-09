import {
  Component,
  ElementRef,
  HostListener,
  computed,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface BmcSelectOption {
  value: string;
  label: string;
  hint?: string;
}

@Component({
  selector: 'app-bmc-select',
  standalone: true,
  templateUrl: './bmc-select.html',
  styleUrl: './bmc-select.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BmcSelect),
      multi: true,
    },
  ],
  host: {
    class: 'bmc-select-host',
    '[class.is-open]': 'open()',
    '[class.is-disabled]': 'disabled()',
  },
})
export class BmcSelect implements ControlValueAccessor {
  private readonly el = inject(ElementRef<HTMLElement>);

  readonly options = input.required<BmcSelectOption[]>();
  readonly label = input('');
  readonly placeholder = input('Select');
  readonly disabled = input(false);
  readonly ariaLabel = input<string | null>(null);

  readonly open = signal(false);
  readonly value = signal('');
  readonly activeIndex = signal(-1);

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  readonly selectedLabel = computed(() => {
    const current = this.value();
    const match = this.options().find((o) => o.value === current);
    return match?.label ?? this.placeholder();
  });

  readonly hasValue = computed(() => this.value().length > 0);

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  toggle(): void {
    if (this.disabled()) return;
    if (this.open()) {
      this.close();
      return;
    }
    this.open.set(true);
    const idx = this.options().findIndex((o) => o.value === this.value());
    this.activeIndex.set(idx >= 0 ? idx : 0);
  }

  close(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.onTouched();
  }

  select(option: BmcSelectOption): void {
    this.value.set(option.value);
    this.onChange(option.value);
    this.close();
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!this.open()) {
          this.openMenu();
        } else {
          const opt = this.options()[this.activeIndex()];
          if (opt) this.select(opt);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!this.open()) {
          this.openMenu();
        } else {
          this.moveActive(1);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.open()) {
          this.openMenu(true);
        } else {
          this.moveActive(-1);
        }
        break;
      case 'Escape':
        if (this.open()) {
          event.preventDefault();
          this.close();
        }
        break;
      case 'Home':
        if (this.open()) {
          event.preventDefault();
          this.activeIndex.set(0);
        }
        break;
      case 'End':
        if (this.open()) {
          event.preventDefault();
          this.activeIndex.set(Math.max(0, this.options().length - 1));
        }
        break;
      default:
        break;
    }
  }

  private openMenu(fromEnd = false): void {
    this.open.set(true);
    const idx = this.options().findIndex((o) => o.value === this.value());
    if (idx >= 0) {
      this.activeIndex.set(idx);
    } else {
      this.activeIndex.set(fromEnd ? Math.max(0, this.options().length - 1) : 0);
    }
  }

  private moveActive(delta: number): void {
    const len = this.options().length;
    if (!len) return;
    this.activeIndex.set((this.activeIndex() + delta + len) % len);
  }

  @HostListener('document:pointerdown', ['$event'])
  onDocumentPointer(event: PointerEvent): void {
    if (!this.open()) return;
    const target = event.target as Node | null;
    if (target && !this.el.nativeElement.contains(target)) {
      this.close();
    }
  }
}
