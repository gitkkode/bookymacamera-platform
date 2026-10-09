import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SeoService } from '../../core/services/seo.service';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { BmcButton } from '../../shared/components/bmc-button/bmc-button';

@Component({
  selector: 'app-about',
  imports: [RouterLink, RevealDirective, BmcButton],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About implements OnInit {
  private readonly seo = inject(SeoService);

  readonly pillars = [
    'Professional people.',
    'Professional cameras.',
    'Professional photography.',
    'One booking.',
  ];

  ngOnInit(): void {
    this.seo.setPage({
      title: 'About BookMyCamera',
      description:
        'We believe getting great photos should be easy. Tell us what you need — BookMyCamera gets the right professional to you.',
      path: '/about',
    });
  }
}
