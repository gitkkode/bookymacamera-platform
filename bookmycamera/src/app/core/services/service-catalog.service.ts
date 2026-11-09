import { Injectable } from '@angular/core';
import { Observable, of, map } from 'rxjs';

import { SERVICES } from '../data/mock-data';
import type { ServiceItem } from '../models';

@Injectable({ providedIn: 'root' })
export class ServiceCatalogService {
  getAll(): Observable<ServiceItem[]> {
    return of([...SERVICES]);
  }

  getBySlug(slug: string): Observable<ServiceItem | null> {
    const normalized = slug?.trim().toLowerCase() ?? '';
    return of(SERVICES).pipe(
      map((services) => services.find((s) => s.slug === normalized) ?? null),
    );
  }
}
