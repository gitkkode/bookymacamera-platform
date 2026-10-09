import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

import { PRICING_PLANS } from '../data/mock-data';
import type { PricingPlan } from '../models';

@Injectable({ providedIn: 'root' })
export class PricingService {
  private readonly apiDelayMs = 300;

  getPlans(): Observable<PricingPlan[]> {
    return of([...PRICING_PLANS]).pipe(delay(this.apiDelayMs));
  }
}
