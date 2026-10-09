import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

import { PhotographerService } from '../../core/services/photographer.service';
import { SeoService } from '../../core/services/seo.service';
import type { Photographer } from '../../core/models';

@Component({
  selector: 'app-photographers',
  imports: [RouterLink],
  templateUrl: './photographers.html',
  styleUrl: './photographers.css',
})
export class Photographers implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly photographerService = inject(PhotographerService);

  readonly photographers = signal<Photographer[]>([]);
  readonly networkCount = signal(0);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly locations = signal<string[]>([]);
  readonly specialities = signal<string[]>([]);

  readonly location = signal<string | null>(null);
  readonly speciality = signal<string | null>(null);
  readonly availableToday = signal(false);
  readonly minRating = signal<number | null>(null);

  readonly ratingOptions = [
    { label: 'Any rating', value: null as number | null },
    { label: '4.5+', value: 4.5 },
    { label: '4.7+', value: 4.7 },
    { label: '4.9+', value: 4.9 },
  ];

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Photographers',
      description:
        'Meet the photographers behind BookMyCamera. Filter by location, speciality, availability, and rating — then book a shoot.',
      path: '/photographers',
    });
    this.bootstrapFilters();
    this.load();
  }

  setLocation(value: string | null): void {
    this.location.set(value);
    this.load();
  }

  setSpeciality(value: string | null): void {
    this.speciality.set(value);
    this.load();
  }

  setAvailableToday(checked: boolean): void {
    this.availableToday.set(checked);
    this.load();
  }

  setMinRating(value: number | null): void {
    this.minRating.set(value);
    this.load();
  }

  clearFilters(): void {
    this.location.set(null);
    this.speciality.set(null);
    this.availableToday.set(false);
    this.minRating.set(null);
    this.load();
  }

  hasActiveFilters(): boolean {
    return (
      this.location() != null ||
      this.speciality() != null ||
      this.availableToday() ||
      this.minRating() != null
    );
  }

  profileLink(ph: Photographer): string {
    return ph.slug || ph.id;
  }

  retry(): void {
    this.load();
  }

  private bootstrapFilters(): void {
    this.photographerService
      .getAll()
      .pipe(catchError(() => of([] as Photographer[])))
      .subscribe((list) => {
        this.networkCount.set(list.length);
        const locs = [...new Set(list.map((p) => p.location))].sort();
        const specs = [...new Set(list.flatMap((p) => p.specialities))].sort();
        this.locations.set(locs);
        this.specialities.set(specs);
      });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.photographerService
      .filter({
        location: this.location(),
        speciality: this.speciality(),
        availableToday: this.availableToday() ? true : null,
        minRating: this.minRating(),
      })
      .pipe(
        catchError(() => {
          this.error.set('Unable to load photographers right now. Please try again.');
          return of([] as Photographer[]);
        }),
      )
      .subscribe((list) => {
        this.photographers.set(list);
        this.loading.set(false);
      });
  }
}
