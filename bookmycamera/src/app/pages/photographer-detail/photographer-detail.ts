import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';

import { PhotographerService } from '../../core/services/photographer.service';
import { SeoService } from '../../core/services/seo.service';
import type { Photographer } from '../../core/models';

@Component({
  selector: 'app-photographer-detail',
  imports: [RouterLink],
  templateUrl: './photographer-detail.html',
  styleUrl: './photographer-detail.css',
})
export class PhotographerDetail implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly photographerService = inject(PhotographerService);
  private readonly route = inject(ActivatedRoute);

  readonly photographer = signal<Photographer | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notFound = signal(false);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const idOrSlug = params.get('idOrSlug')?.trim() ?? '';
          this.loading.set(true);
          this.error.set(null);
          this.notFound.set(false);
          this.photographer.set(null);

          if (!idOrSlug) {
            this.notFound.set(true);
            this.loading.set(false);
            return of(null);
          }

          return this.resolvePhotographer(idOrSlug).pipe(
            catchError(() => {
              this.error.set('Unable to load this photographer right now. Please try again.');
              return of(null);
            }),
          );
        }),
      )
      .subscribe((ph) => {
        this.loading.set(false);
        if (this.error()) {
          return;
        }
        if (!ph) {
          this.notFound.set(true);
          this.seo.setPage({
            title: 'Photographer not found',
            description: 'The requested photographer profile could not be found.',
            path: '/photographers',
          });
          return;
        }
        this.photographer.set(ph);
        this.seo.setPage({
          title: ph.name,
          description: ph.bio,
          path: `/photographers/${ph.slug || ph.id}`,
        });
      });
  }

  retry(): void {
    const idOrSlug = this.route.snapshot.paramMap.get('idOrSlug')?.trim() ?? '';
    if (!idOrSlug) {
      this.notFound.set(true);
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.notFound.set(false);
    this.resolvePhotographer(idOrSlug)
      .pipe(
        catchError(() => {
          this.error.set('Unable to load this photographer right now. Please try again.');
          return of(null);
        }),
      )
      .subscribe((ph) => {
        this.loading.set(false);
        if (this.error()) {
          return;
        }
        if (!ph) {
          this.notFound.set(true);
          return;
        }
        this.photographer.set(ph);
        this.seo.setPage({
          title: ph.name,
          description: ph.bio,
          path: `/photographers/${ph.slug || ph.id}`,
        });
      });
  }

  /** Prefer slug lookup; fall back to id so both URL forms work. */
  private resolvePhotographer(idOrSlug: string) {
    const key = idOrSlug.trim();
    return this.photographerService.getBySlug(key).pipe(
      switchMap((bySlug) => {
        if (bySlug) {
          return of(bySlug);
        }
        return this.photographerService.getById(key);
      }),
    );
  }
}
