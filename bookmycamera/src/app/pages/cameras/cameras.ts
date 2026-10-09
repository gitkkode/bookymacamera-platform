import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

import { CameraService } from '../../core/services/camera.service';
import { SeoService } from '../../core/services/seo.service';
import type { Camera } from '../../core/models';

@Component({
  selector: 'app-cameras',
  imports: [RouterLink],
  templateUrl: './cameras.html',
  styleUrl: './cameras.css',
})
export class Cameras implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly cameraService = inject(CameraService);

  readonly cameras = signal<Camera[]>([]);
  readonly catalogueCount = signal(0);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly brand = signal<string | null>(null);

  readonly brands = this.cameraService.brands;

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Cameras',
      description:
        'Browse professional cinema and mirrorless cameras available with BookMyCamera. Choose a body or let us match one to your shoot.',
      path: '/cameras',
    });
    this.loadCatalogueCount();
    this.load();
  }

  setBrand(value: string | null): void {
    this.brand.set(value || null);
    this.load();
  }

  clearFilters(): void {
    this.brand.set(null);
    this.load();
  }

  hasActiveFilters(): boolean {
    return this.brand() != null;
  }

  retry(): void {
    this.load();
  }

  private loadCatalogueCount(): void {
    this.cameraService
      .getAll()
      .pipe(catchError(() => of([] as Camera[])))
      .subscribe((list) => this.catalogueCount.set(list.length));
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.cameraService
      .filter({ brand: this.brand() })
      .pipe(
        catchError(() => {
          this.error.set('Unable to load cameras right now. Please try again.');
          return of([] as Camera[]);
        }),
      )
      .subscribe((list) => {
        this.cameras.set(list);
        this.loading.set(false);
      });
  }
}
