import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

import { ServiceCatalogService } from '../../core/services/service-catalog.service';
import { SeoService } from '../../core/services/seo.service';
import type { ServiceItem } from '../../core/models';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { BmcButton } from '../../shared/components/bmc-button/bmc-button';

@Component({
  selector: 'app-services',
  imports: [RouterLink, RevealDirective, BmcButton],
  templateUrl: './services.html',
  styleUrl: './services.css',
})
export class Services implements OnInit {
  private readonly catalog = inject(ServiceCatalogService);
  private readonly seo = inject(SeoService);

  readonly services = signal<ServiceItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Photography Services',
      description:
        'Food, product, portrait, event, corporate, fashion, and more — book professional photography with BookMyCamera.',
      path: '/services',
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.catalog
      .getAll()
      .pipe(
        catchError(() => {
          this.error.set('Unable to load services right now. Please try again.');
          return of([] as ServiceItem[]);
        }),
      )
      .subscribe((list) => {
        this.services.set(list);
        this.loading.set(false);
      });
  }
}
