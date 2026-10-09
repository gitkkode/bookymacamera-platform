import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';

import { ServiceCatalogService } from '../../core/services/service-catalog.service';
import { PortfolioService } from '../../core/services/portfolio.service';
import { SeoService } from '../../core/services/seo.service';
import type { PortfolioCategory, PortfolioItem, ServiceItem } from '../../core/models';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { BmcButton } from '../../shared/components/bmc-button/bmc-button';

@Component({
  selector: 'app-service-detail',
  imports: [RouterLink, RevealDirective, BmcButton],
  templateUrl: './service-detail.html',
  styleUrl: './service-detail.css',
})
export class ServiceDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catalog = inject(ServiceCatalogService);
  private readonly portfolioService = inject(PortfolioService);
  private readonly seo = inject(SeoService);

  readonly service = signal<ServiceItem | null>(null);
  readonly examples = signal<PortfolioItem[]>([]);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly openFaq = signal<number | null>(0);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const slug = params.get('slug') ?? '';
          this.loading.set(true);
          this.notFound.set(false);
          this.service.set(null);
          return this.catalog.getBySlug(slug).pipe(
            catchError(() => of(null)),
          );
        }),
      )
      .subscribe((svc) => {
        this.loading.set(false);
        if (!svc) {
          this.notFound.set(true);
          this.seo.setPage({
            title: 'Service Not Found',
            description: 'The photography service you requested could not be found.',
            path: '/services',
          });
          return;
        }

        this.service.set(svc);
        this.seo.setPage({
          title: svc.title,
          description: svc.description,
          path: `/services/${svc.slug}`,
        });
        this.loadExamples(svc);
      });
  }

  toggleFaq(index: number): void {
    this.openFaq.update((current) => (current === index ? null : index));
  }

  private loadExamples(svc: ServiceItem): void {
    const category = this.mapCategory(svc);
    this.portfolioService
      .filterByCategory(category)
      .pipe(catchError(() => of([] as PortfolioItem[])))
      .subscribe((items) => {
        const picked = items.slice(0, 6);
        if (picked.length > 0) {
          this.examples.set(picked);
          return;
        }
        this.examples.set([
          {
            id: `svc-fallback-${svc.id}`,
            category: category ?? 'Brands',
            image: svc.image,
            alt: svc.title,
            caption: svc.shortTitle,
          },
        ]);
      });
  }

  private mapCategory(svc: ServiceItem): PortfolioCategory | null {
    const map: Record<string, PortfolioCategory> = {
      food: 'Food',
      product: 'Products',
      portrait: 'People',
      event: 'Events',
      corporate: 'Brands',
      'social media': 'Brands',
      fashion: 'People',
      'real estate': 'Products',
      'brand campaigns': 'Brands',
    };
    return map[svc.shortTitle.toLowerCase()] ?? null;
  }
}
