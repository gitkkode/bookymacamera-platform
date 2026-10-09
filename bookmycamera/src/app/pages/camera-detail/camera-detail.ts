import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';

import { CameraService } from '../../core/services/camera.service';
import { SeoService } from '../../core/services/seo.service';
import type { Camera } from '../../core/models';

@Component({
  selector: 'app-camera-detail',
  imports: [RouterLink],
  templateUrl: './camera-detail.html',
  styleUrl: './camera-detail.css',
})
export class CameraDetail implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly cameraService = inject(CameraService);
  private readonly route = inject(ActivatedRoute);

  readonly camera = signal<Camera | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notFound = signal(false);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const slug = params.get('slug')?.trim() ?? '';
          this.loading.set(true);
          this.error.set(null);
          this.notFound.set(false);
          this.camera.set(null);

          if (!slug) {
            this.notFound.set(true);
            this.loading.set(false);
            return of(null);
          }

          return this.cameraService.getBySlug(slug).pipe(
            catchError(() => {
              this.error.set('Unable to load this camera right now. Please try again.');
              return of(null);
            }),
          );
        }),
      )
      .subscribe((cam) => {
        this.loading.set(false);
        if (this.error()) {
          return;
        }
        if (!cam) {
          this.notFound.set(true);
          this.seo.setPage({
            title: 'Camera not found',
            description: 'The requested camera could not be found on BookMyCamera.',
            path: '/cameras',
          });
          return;
        }
        this.camera.set(cam);
        this.seo.setPage({
          title: `${cam.brand} ${cam.model}`,
          description: cam.description,
          path: `/cameras/${cam.slug}`,
        });
      });
  }

  retry(): void {
    const slug = this.route.snapshot.paramMap.get('slug')?.trim() ?? '';
    if (!slug) {
      this.notFound.set(true);
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.notFound.set(false);
    this.cameraService
      .getBySlug(slug)
      .pipe(
        catchError(() => {
          this.error.set('Unable to load this camera right now. Please try again.');
          return of(null);
        }),
      )
      .subscribe((cam) => {
        this.loading.set(false);
        if (this.error()) {
          return;
        }
        if (!cam) {
          this.notFound.set(true);
          return;
        }
        this.camera.set(cam);
        this.seo.setPage({
          title: `${cam.brand} ${cam.model}`,
          description: cam.description,
          path: `/cameras/${cam.slug}`,
        });
      });
  }
}
