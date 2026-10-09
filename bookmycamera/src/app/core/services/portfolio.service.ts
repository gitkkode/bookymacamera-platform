import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';

import { PORTFOLIO } from '../data/mock-data';
import type { PortfolioCategory, PortfolioItem } from '../models';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly apiDelayMs = 300;

  getAll(): Observable<PortfolioItem[]> {
    return of([...PORTFOLIO]).pipe(delay(this.apiDelayMs));
  }

  filterByCategory(category: PortfolioCategory | null | undefined): Observable<PortfolioItem[]> {
    return of(PORTFOLIO).pipe(
      delay(this.apiDelayMs),
      map((items) => {
        if (!category) {
          return [...items];
        }
        return items.filter((item) => item.category === category);
      }),
    );
  }
}
