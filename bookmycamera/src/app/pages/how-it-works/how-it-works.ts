import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SeoService } from '../../core/services/seo.service';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { BmcButton } from '../../shared/components/bmc-button/bmc-button';

interface HowStep {
  key: string;
  title: string;
  body: string;
}

interface FaqItem {
  q: string;
  a: string;
}

@Component({
  selector: 'app-how-it-works',
  imports: [RouterLink, RevealDirective, BmcButton],
  templateUrl: './how-it-works.html',
  styleUrl: './how-it-works.css',
})
export class HowItWorks implements OnInit {
  private readonly seo = inject(SeoService);

  readonly openFaq = signal<number | null>(0);

  readonly steps: HowStep[] = [
    {
      key: 'BOOK',
      title: 'Tell us the shoot',
      body: 'Shoot type, location, timing, and any camera preference. Keep the brief short — we fill in the gaps.',
    },
    {
      key: 'MATCH',
      title: 'We match your team',
      body: 'The right professional photographer and the right camera for food, product, portrait, event, or brand work.',
    },
    {
      key: 'DISPATCH',
      title: 'We dispatch',
      body: 'Your team heads out. Dispatch in as little as 90 minutes when the brief, availability, and location allow.',
    },
    {
      key: 'SHOOT',
      title: 'We shoot',
      body: 'On location with professional kit — lighting, direction, and frames built for how you will actually use them.',
    },
    {
      key: 'DELIVER',
      title: 'You get the frames',
      body: 'Curated digital delivery after the shoot — ready for menus, campaigns, listings, and feeds.',
    },
  ];

  readonly faqs: FaqItem[] = [
    {
      q: 'How quickly can someone arrive?',
      a: 'We aim to dispatch in as little as 90 minutes, subject to availability and location. Arrival time depends on distance, traffic, and whether a matched photographer and camera are free for your window.',
    },
    {
      q: 'What cameras do you have?',
      a: 'Our catalogue includes cinema, full-frame, and medium-format bodies across Sony, Canon, Nikon, and Fujifilm. Browse Cameras to see models, or let us choose the best kit for your brief.',
    },
    {
      q: 'Can I choose a photographer?',
      a: 'Yes — you can request a photographer when available, or let us match someone suited to your shoot type and location.',
    },
    {
      q: 'Can I choose a camera?',
      a: 'Yes. Pick a specific model in booking, or select “let us choose” and we will match kit to the brief.',
    },
    {
      q: 'Can I book tomorrow?',
      a: 'Yes. Choose a scheduled slot for tomorrow or a later date. Same-day and ASAP requests are also supported when inventory allows.',
    },
    {
      q: 'Can I book an event?',
      a: 'Yes. Event coverage is a core service — launches, conferences, parties, and brand activations. Book Event or Custom for longer coverage.',
    },
    {
      q: 'How are photos delivered?',
      a: 'Digitally after the shoot, typically as curated high-resolution stills. Turnaround depends on volume and any rush selects you request in the brief.',
    },
    {
      q: 'Can I request edits?',
      a: 'Basic colour correction and select retouching are common. Heavier retouching or additional rounds can be scoped — note it in your brief or contact the team.',
    },
    {
      q: 'What happens if my photographer is unavailable?',
      a: 'We rematch from the network with equivalent speciality and kit whenever possible, and keep you informed before the shoot window.',
    },
  ];

  ngOnInit(): void {
    this.seo.setPage({
      title: 'How It Works',
      description:
        'Book → Match → Dispatch → Shoot → Deliver. BookMyCamera pairs a professional photographer with a professional camera — dispatch in as little as 90 minutes, subject to availability.',
      path: '/how-it-works',
    });
  }

  toggleFaq(index: number): void {
    this.openFaq.update((current) => (current === index ? null : index));
  }
}
