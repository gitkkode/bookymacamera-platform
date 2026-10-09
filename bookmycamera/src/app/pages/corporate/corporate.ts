import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SeoService } from '../../core/services/seo.service';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-corporate',
  imports: [RouterLink, RevealDirective],
  templateUrl: './corporate.html',
  styleUrl: './corporate.css',
})
export class Corporate implements OnInit {
  private readonly seo = inject(SeoService);

  readonly targets = [
    'Restaurants',
    'D2C brands',
    'E-commerce',
    'Startups',
    'Hotels',
    'Agencies',
    'Corporate teams',
  ];

  readonly solutions = [
    {
      title: 'One-off shoot',
      body: 'Launch creatives, menu refreshes, founder portraits — booked when you need them.',
    },
    {
      title: 'Monthly content',
      body: 'Recurring sessions for social, product drops, and always-on brand channels.',
    },
    {
      title: 'Multi-location',
      body: 'Consistent coverage across sites, kitchens, stores, or offices.',
    },
    {
      title: 'Events',
      body: 'Launches, conferences, and brand activations with professional event coverage.',
    },
    {
      title: 'Campaigns',
      body: 'Concept-driven campaign sets with hero frames and supporting assets.',
    },
  ];

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Corporate Photography',
      description:
        'Professional photography for restaurants, D2C, e-commerce, startups, hotels, agencies, and corporate teams that move fast.',
      path: '/corporate',
    });
  }
}
