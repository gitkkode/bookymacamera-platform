import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

import { PricingService } from '../../core/services/pricing.service';
import { SeoService } from '../../core/services/seo.service';
import type { PricingPlan } from '../../core/models';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { BmcButton } from '../../shared/components/bmc-button/bmc-button';

@Component({
  selector: 'app-pricing',
  imports: [RouterLink, RevealDirective, BmcButton],
  templateUrl: './pricing.html',
  styleUrl: './pricing.css',
})
export class Pricing implements OnInit {
  private readonly pricing = inject(PricingService);
  private readonly seo = inject(SeoService);

  readonly plans = signal<PricingPlan[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Pricing',
      description:
        'Quick Shoot, Content Shoot, Event, and Custom photography packages. Placeholder prices are indicative — confirm on booking with BookMyCamera.',
      path: '/pricing',
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.pricing
      .getPlans()
      .pipe(
        catchError(() => {
          this.error.set('Unable to load pricing right now. Please try again.');
          return of([] as PricingPlan[]);
        }),
      )
      .subscribe((list) => {
        this.plans.set(list);
        this.loading.set(false);
      });
  }
}
