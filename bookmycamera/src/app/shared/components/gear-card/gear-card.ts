import { Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import type { GearItem } from '../../../core/models';

@Component({
  selector: 'app-gear-card',
  imports: [DecimalPipe],
  templateUrl: './gear-card.html',
  styleUrl: './gear-card.css',
})
export class GearCard {
  readonly item = input.required<GearItem>();
  /** Prefix the meta line with the category (used in search results). */
  readonly showCategory = input(false);
  readonly opened = output<GearItem>();
}
