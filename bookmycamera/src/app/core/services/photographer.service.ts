import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';

import { PHOTOGRAPHERS } from '../data/mock-data';
import type { Photographer } from '../models';

export interface PhotographerFilter {
  location?: string | null;
  speciality?: string | null;
  availableToday?: boolean | null;
  minRating?: number | null;
}

@Injectable({ providedIn: 'root' })
export class PhotographerService {
  private readonly apiDelayMs = 350;

  getAll(): Observable<Photographer[]> {
    return of([...PHOTOGRAPHERS]).pipe(delay(this.apiDelayMs));
  }

  getById(id: string): Observable<Photographer | null> {
    const normalized = id?.trim() ?? '';
    return of(PHOTOGRAPHERS).pipe(
      delay(this.apiDelayMs),
      map((list) => list.find((p) => p.id === normalized) ?? null),
    );
  }

  getBySlug(slug: string): Observable<Photographer | null> {
    const normalized = slug?.trim().toLowerCase() ?? '';
    return of(PHOTOGRAPHERS).pipe(
      delay(this.apiDelayMs),
      map((list) => list.find((p) => p.slug === normalized) ?? null),
    );
  }

  filter(filters: PhotographerFilter = {}): Observable<Photographer[]> {
    return of(PHOTOGRAPHERS).pipe(
      delay(this.apiDelayMs),
      map((list) => this.applyFilters(list, filters)),
    );
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
