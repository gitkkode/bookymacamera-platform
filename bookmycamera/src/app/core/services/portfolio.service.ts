import { Injectable } from '@angular/core';
import { Observable, of, map } from 'rxjs';

import { PORTFOLIO } from '../data/mock-data';
import type { PortfolioCategory, PortfolioItem } from '../models';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  getAll(): Observable<PortfolioItem[]> {
    return of([...PORTFOLIO]);
  }

  filterByCategory(category: PortfolioCategory | null | undefined): Observable<PortfolioItem[]> {
    return of(PORTFOLIO).pipe(
      map((items) => {
        if (!category) {
          return [...items];
        }
        return items.filter((item) => item.category === category);
      }),
    );
  }
}
