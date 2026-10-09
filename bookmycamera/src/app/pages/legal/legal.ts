import { Component, OnInit, inject, signal } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { filter } from 'rxjs';

import { SeoService } from '../../core/services/seo.service';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { BmcButton } from '../../shared/components/bmc-button/bmc-button';

type LegalKind = 'privacy' | 'terms' | 'cancellation';

interface LegalDoc {
  kind: LegalKind;
  title: string;
  description: string;
  path: string;
  updated: string;
  sections: { heading: string; paragraphs: string[] }[];
}

@Component({
  selector: 'app-legal',
  imports: [RouterLink, RouterLinkActive, RevealDirective, BmcButton],
  templateUrl: './legal.html',
  styleUrl: './legal.css',
})
export class Legal implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly docs: Record<LegalKind, LegalDoc> = {
    privacy: {
      kind: 'privacy',
      title: 'Privacy Policy',
      description:
        'How BookMyCamera collects and uses information when you browse, book, or contact us. Placeholder policy — not legal advice.',
      path: '/privacy',
      updated: 'September 2026',
      sections: [
        {
          heading: 'Overview',
          paragraphs: [
            'This Privacy Policy explains how BookMyCamera (“we”, “us”) may collect, use, and share information when you use our website and booking services. It is placeholder professional copy for product launch and is not legal advice.',
            'By using BookMyCamera, you acknowledge that information you provide may be processed to operate the service, respond to enquiries, and improve the product.',
          ],
        },
        {
          heading: 'Information we may collect',
          paragraphs: [
            'Contact and booking details you submit — such as name, email, phone, location, shoot preferences, and message content.',
            'Technical data such as device type, browser, approximate location derived from IP, and usage analytics that help us keep the site reliable.',
          ],
        },
        {
          heading: 'How we use information',
          paragraphs: [
            'To fulfil bookings, match photographers and cameras, communicate about your shoot, and respond to support or partnership enquiries.',
            'To improve product experience, prevent abuse, and meet applicable legal obligations where required.',
          ],
        },
        {
          heading: 'Sharing',
          paragraphs: [
            'We may share relevant details with photographers, logistics partners, or service providers only as needed to deliver a booked shoot or operate the platform.',
            'We do not sell your personal information. We may disclose information if required by law or to protect rights, safety, and security.',
          ],
        },
        {
          heading: 'Your choices',
          paragraphs: [
            'You may contact us to request access, correction, or deletion of personal information we hold, subject to legal and operational limits.',
            'For privacy questions, email hello@bookmycamera.com (placeholder contact).',
          ],
        },
      ],
    },
    terms: {
      kind: 'terms',
      title: 'Terms of Service',
      description:
        'Terms governing use of the BookMyCamera website and booking experience. Placeholder terms — not legal advice.',
      path: '/terms',
      updated: 'September 2026',
      sections: [
        {
          heading: 'Agreement',
          paragraphs: [
            'These Terms of Service govern your use of the BookMyCamera website and related booking flows. This is placeholder professional copy and is not legal advice. By accessing or using the service, you agree to these terms.',
          ],
        },
        {
          heading: 'The service',
          paragraphs: [
            'BookMyCamera helps customers request professional photography with a professional camera. Matching, dispatch timing, and availability depend on location, inventory, and partner capacity.',
            'Statements such as “dispatch in as little as 90 minutes” describe an operational goal subject to availability and location — not a guaranteed arrival time unless expressly confirmed for a specific booking.',
          ],
        },
        {
          heading: 'Bookings and pricing',
          paragraphs: [
            'Displayed prices may be indicative placeholders until confirmed at booking. Final fees, scope, and deliverables are confirmed for each shoot.',
            'You are responsible for providing accurate brief, location, and timing details so we can match appropriately.',
          ],
        },
        {
          heading: 'Acceptable use',
          paragraphs: [
            'You agree not to misuse the platform, submit fraudulent requests, harass partners, or attempt unauthorized access to systems or data.',
          ],
        },
        {
          heading: 'Limitation',
          paragraphs: [
            'To the fullest extent permitted by law, BookMyCamera is not liable for indirect or consequential losses arising from use of the site or inability to complete a shoot due to availability, weather, venue restrictions, or factors outside our reasonable control.',
            'Questions about these terms: hello@bookmycamera.com (placeholder).',
          ],
        },
      ],
    },
    cancellation: {
      kind: 'cancellation',
      title: 'Cancellation Policy',
      description:
        'How cancellations and changes work for BookMyCamera shoots. Placeholder policy — not legal advice.',
      path: '/cancellation',
      updated: 'September 2026',
      sections: [
        {
          heading: 'Overview',
          paragraphs: [
            'This Cancellation Policy describes how changes and cancellations may be handled for BookMyCamera bookings. It is placeholder professional copy for launch and is not legal advice. Specific terms for your shoot will be confirmed at booking.',
          ],
        },
        {
          heading: 'Customer cancellations',
          paragraphs: [
            'Please cancel or reschedule as early as possible so we can release photographer and camera capacity.',
            'Depending on timing relative to the scheduled shoot, fees or partial charges may apply. Exact windows will be stated when live pricing and operations are finalized.',
          ],
        },
        {
          heading: 'Changes by BookMyCamera',
          paragraphs: [
            'If a photographer becomes unavailable, we will attempt to rematch an equivalent professional and kit, and notify you promptly.',
            'If we cannot fulfil a confirmed booking for reasons within our control, we will work with you on a reschedule or a refund/credit according to the terms confirmed for that booking.',
          ],
        },
        {
          heading: 'No-shows and venue issues',
          paragraphs: [
            'If the shoot cannot proceed because the location is inaccessible, required subjects are absent, or safety conditions prevent work, the booking may be treated as a customer-side cancellation or incomplete shoot under the terms shared at confirmation.',
          ],
        },
        {
          heading: 'Contact',
          paragraphs: [
            'To cancel or change a booking, contact us via the Contact page, WhatsApp, or hello@bookmycamera.com (placeholder) with your booking reference.',
          ],
        },
      ],
    },
  };

  readonly doc = signal<LegalDoc>(this.docs.privacy);

  ngOnInit(): void {
    this.applyFromUrl();
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.applyFromUrl());
  }

  private applyFromUrl(): void {
    const path = this.router.url.split('?')[0].replace(/^\//, '').toLowerCase();
    const kind = this.resolveKind(path);
    const doc = this.docs[kind];
    this.doc.set(doc);
    this.seo.setPage({
      title: doc.title,
      description: doc.description,
      path: doc.path,
    });
  }

  private resolveKind(path: string): LegalKind {
    if (path.includes('terms')) {
      return 'terms';
    }
    if (path.includes('cancellation')) {
      return 'cancellation';
    }
    const dataKind = this.route.snapshot.data['legal'] as LegalKind | undefined;
    if (dataKind && this.docs[dataKind]) {
      return dataKind;
    }
    return 'privacy';
  }
}
