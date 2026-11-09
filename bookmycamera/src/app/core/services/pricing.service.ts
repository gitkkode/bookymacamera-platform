import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { PRICING_PLANS } from '../data/mock-data';
import type { PricingPlan } from '../models';

@Injectable({ providedIn: 'root' })
export class PricingService {
  getPlans(): Observable<PricingPlan[]> {
    return of([...PRICING_PLANS]);
  }
}
