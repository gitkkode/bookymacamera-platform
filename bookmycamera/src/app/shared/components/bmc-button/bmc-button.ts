import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

export type BmcButtonVariant = 'primary' | 'secondary' | 'ghost';
export type BmcButtonSize = 'md' | 'lg';
export type BmcButtonType = 'button' | 'submit';

@Component({
  selector: 'app-bmc-button',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './bmc-button.html',
  styleUrl: './bmc-button.css',
})
export class BmcButton {
  readonly variant = input<BmcButtonVariant>('primary');
  readonly size = input<BmcButtonSize>('md');
  readonly href = input<string | null>(null);
  readonly type = input<BmcButtonType>('button');
  readonly disabled = input(false);
  readonly ariaLabel = input<string | null>(null);

  readonly clicked = output<MouseEvent>();

  protected onClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.clicked.emit(event);
  }

  protected classes(): string {
    const parts = ['bmc-btn', `bmc-btn--${this.variant()}`];
    if (this.size() === 'lg') {
      parts.push('bmc-btn--lg');
    }
    return parts.join(' ');
  }
}
