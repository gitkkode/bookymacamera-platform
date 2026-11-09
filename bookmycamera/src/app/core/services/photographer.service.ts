import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';

import type { Photographer } from '../models';

const PHOTOGRAPHERS_URL = '/mock/photographers.json';

export interface PhotographerFilter {
  location?: string | null;
  speciality?: string | null;
  availableToday?: boolean | null;
  minRating?: number | null;
}

@Injectable({ providedIn: 'root' })
export class PhotographerService {
  private readonly http = inject(HttpClient);

  private readonly photographers$ = this.http
    .get<Photographer[]>(PHOTOGRAPHERS_URL)
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  getAll(): Observable<Photographer[]> {
    return this.photographers$.pipe(map((list) => [...list]));
  }

  getById(id: string): Observable<Photographer | null> {
    const normalized = id?.trim() ?? '';
    return this.photographers$.pipe(
      map((list) => list.find((p) => p.id === normalized) ?? null),
    );
  }

  getBySlug(slug: string): Observable<Photographer | null> {
    const normalized = slug?.trim().toLowerCase() ?? '';
    return this.photographers$.pipe(
      map((list) => list.find((p) => p.slug === normalized) ?? null),
    );
  }

  filter(filters: PhotographerFilter = {}): Observable<Photographer[]> {
    return this.photographers$.pipe(map((list) => this.applyFilters(list, filters)));
  }

  private applyFilters(
    photographers: Photographer[],
    filters: PhotographerFilter,
  ): Photographer[] {
    const location = filters.location?.trim().toLowerCase() || null;
    const speciality = filters.speciality?.trim().toLowerCase() || null;
    const availableToday = filters.availableToday;
    const minRating = filters.minRating ?? null;

    return photographers.filter((photographer) => {
      if (location && !photographer.location.toLowerCase().includes(location)) {
        return false;
      }
      if (
        speciality &&
        !photographer.specialities.some((s) => s.toLowerCase().includes(speciality))
      ) {
        return false;
      }
      if (availableToday === true && !photographer.availableToday) {
        return false;
      }
      if (availableToday === false && photographer.availableToday) {
        return false;
      }
      if (minRating != null && photographer.rating < minRating) {
        return false;
      }
      return true;
    });
  }
}
