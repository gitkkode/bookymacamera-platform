import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface FooterLink {
  label: string;
  path: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  readonly year = new Date().getFullYear();

  readonly links: FooterLink[] = [
    { label: 'Book a Shoot', path: '/book' },
    { label: 'Cameras', path: '/cameras' },
    { label: 'Photographers', path: '/photographers' },
    { label: 'Services', path: '/services' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Corporate', path: '/corporate' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  readonly legal: FooterLink[] = [
    { label: 'Privacy', path: '/privacy' },
    { label: 'Terms', path: '/terms' },
    { label: 'Cancellation', path: '/cancellation' },
  ];
}
