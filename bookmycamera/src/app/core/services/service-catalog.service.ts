import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';

import { SERVICES } from '../data/mock-data';
import type { ServiceItem } from '../models';

@Injectable({ providedIn: 'root' })
export class ServiceCatalogService {
  private readonly apiDelayMs = 300;

  getAll(): Observable<ServiceItem[]> {
    return of([...SERVICES]).pipe(delay(this.apiDelayMs));
  }

  getBySlug(slug: string): Observable<ServiceItem | null> {
    const normalized = slug?.trim().toLowerCase() ?? '';
    return of(SERVICES).pipe(
      delay(this.apiDelayMs),
      map((services) => services.find((s) => s.slug === normalized) ?? null),
    );
  }
}
