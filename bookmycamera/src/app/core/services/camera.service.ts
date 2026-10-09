import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';

import { CAMERAS, CAMERA_BRANDS } from '../data/cameras';
import type { Camera } from '../models';

export interface CameraFilter {
  brand?: string | null;
}

@Injectable({ providedIn: 'root' })
export class CameraService {
  private readonly apiDelayMs = 350;

  readonly brands: readonly string[] = CAMERA_BRANDS;

  getAll(): Observable<Camera[]> {
    return of([...CAMERAS]).pipe(delay(this.apiDelayMs));
  }

  getBySlug(slug: string): Observable<Camera | null> {
    const normalized = slug?.trim().toLowerCase() ?? '';
    return of(CAMERAS).pipe(
      delay(this.apiDelayMs),
      map((cameras) => cameras.find((c) => c.slug === normalized) ?? null),
    );
  }

  filter(filters: CameraFilter = {}): Observable<Camera[]> {
    const brand = filters.brand ?? null;
    return of(CAMERAS).pipe(
      delay(this.apiDelayMs),
      map((cameras) => (brand ? cameras.filter((c) => c.brand === brand) : [...cameras])),
    );
  }
}
