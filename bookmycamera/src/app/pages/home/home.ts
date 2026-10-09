import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';

import { CAMERAS, CAMERA_BRANDS } from '../../core/data/cameras';
import type { Camera, Photographer } from '../../core/models';
import { CameraService } from '../../core/services/camera.service';
import { PhotographerService } from '../../core/services/photographer.service';
import { SeoService } from '../../core/services/seo.service';
import { BmcSelect } from '../../shared/components/bmc-select/bmc-select';

interface ShootCategory {
  title: string;
  type: string;
  slug: string;
  useCases: string;
  image: string;
}

interface OpsMetric {
  value: string;
  label: string;
  note?: string;
}

interface HowStep {
  num: string;
  title: string;
  body: string;
}

interface ValuePoint {
  title: string;
  body: string;
}

interface PricingTeaser {
  name: string;
  duration: string;
  summary: string;
  priceLabel: string;
  typeParam: string;
}

interface FeaturedShot {
  id: string;
  image: string;
  alt: string;
  photographer: string;
  camera: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, FormsModule, BmcSelect],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  private readonly seo = inject(SeoService);
  private readonly cameraService = inject(CameraService);
  private readonly photographerService = inject(PhotographerService);

  private revealObserver: IntersectionObserver | null = null;
  private shotsObserver: IntersectionObserver | null = null;

  readonly cameras = signal<Camera[]>([]);
  readonly camerasLoading = signal(true);
  readonly camerasError = signal<string | null>(null);

  readonly photographers = signal<Photographer[]>([]);
  readonly photographersLoading = signal(true);
  readonly photographersError = signal<string | null>(null);

  quickShoot = 'Food Photography';
  quickLocation = 'Indiranagar, Bengaluru';
  quickWhen = 'Today · ASAP';
  quickDuration = '2h';

  readonly shootSelectOptions = [
    { value: 'Food Photography', label: 'Food Photography', hint: 'Menus, restaurants, delivery' },
    { value: 'Product Photography', label: 'Product Photography', hint: 'Packaging & launches' },
    { value: 'Portrait Photography', label: 'Portrait Photography', hint: 'Founders & headshots' },
    { value: 'Event Photography', label: 'Event Photography', hint: 'Nights, dinners, launches' },
    { value: 'Corporate Photography', label: 'Corporate Photography', hint: 'Teams & offices' },
    { value: 'Social Media Content', label: 'Social Media Content', hint: 'Feed & reels stills' },
    { value: 'Fashion Photography', label: 'Fashion Photography', hint: 'Lookbooks & editorial' },
    { value: 'Real Estate Photography', label: 'Real Estate Photography', hint: 'Spaces & interiors' },
  ];

  readonly locationSelectOptions = [
    { value: 'Indiranagar, Bengaluru', label: 'Indiranagar, Bengaluru', hint: 'Popular · fast dispatch' },
    { value: 'Koramangala, Bengaluru', label: 'Koramangala, Bengaluru' },
    { value: 'HSR Layout, Bengaluru', label: 'HSR Layout, Bengaluru' },
    { value: 'Whitefield, Bengaluru', label: 'Whitefield, Bengaluru' },
    { value: 'Bandra, Mumbai', label: 'Bandra, Mumbai' },
    { value: 'Andheri, Mumbai', label: 'Andheri, Mumbai' },
    { value: 'Connaught Place, Delhi', label: 'Connaught Place, Delhi' },
    { value: 'Jubilee Hills, Hyderabad', label: 'Jubilee Hills, Hyderabad' },
  ];

  readonly whenSelectOptions = [
    { value: 'Today · ASAP', label: 'Today · ASAP', hint: 'Dispatch in as little as 90 min*' },
    { value: 'Today · Evening', label: 'Today · Evening', hint: 'After 5 PM' },
    { value: 'Tomorrow · Morning', label: 'Tomorrow · Morning' },
    { value: 'Tomorrow · Afternoon', label: 'Tomorrow · Afternoon' },
    { value: 'This Weekend', label: 'This Weekend' },
    { value: 'Schedule later', label: 'Schedule later', hint: 'Pick exact time in booking' },
  ];

  readonly durationPicks = [
    { value: '1h', label: '1 hr' },
    { value: '2h', label: '2 hr' },
    { value: '4h', label: '4 hr' },
    { value: '8h', label: 'Full day' },
  ];

  readonly trustChips = [
    'Any event · any party',
    'Express dispatch',
    'Pro camera included',
  ];

  readonly opsMetrics: OpsMetric[] = [
    { value: '4', label: 'Cities live', note: 'Bengaluru · Mumbai · Delhi · Hyderabad' },
    { value: '90 min*', label: 'Avg dispatch target', note: 'Subject to availability' },
    { value: '2,400+', label: 'Shoots fulfilled', note: 'Demo network volume' },
    {
      value: String(CAMERAS.length),
      label: 'Pro cameras in network',
      note: CAMERA_BRANDS.join(' · '),
    },
  ];

  readonly shootCategories: ShootCategory[] = [
    {
      title: 'Food',
      type: 'Food',
      slug: 'food-photography',
      useCases: 'Menus · restaurants · delivery apps · social plates',
      image:
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Product',
      type: 'Product',
      slug: 'product-photography',
      useCases: 'Packaging · ecommerce · launches · lifestyle',
      image:
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Portrait',
      type: 'Portrait',
      slug: 'portrait-photography',
      useCases: 'Founders · headshots · personal brand',
      image:
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Event',
      type: 'Event',
      slug: 'event-photography',
      useCases: 'Launches · dinners · conferences · nights out',
      image:
        'https://images.unsplash.com/photo-1540575467163-952df1a4c7a0?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Corporate',
      type: 'Corporate',
      slug: 'corporate-photography',
      useCases: 'Teams · offices · leadership · press kits',
      image:
        'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Social',
      type: 'Social Media',
      slug: 'social-media-content',
      useCases: 'Feed stills · reels frames · creator content',
      image:
        'https://images.unsplash.com/photo-1611162616475-46b635cb4953?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Fashion',
      type: 'Fashion',
      slug: 'fashion-photography',
      useCases: 'Lookbooks · editorial · campaign stills',
      image:
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Real Estate',
      type: 'Real Estate',
      slug: 'real-estate-photography',
      useCases: 'Interiors · listings · hospitality spaces',
      image:
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80',
    },
  ];

  readonly howSteps: HowStep[] = [
    {
      num: '01',
      title: 'Book',
      body: 'Pick shoot type, location, timing, and duration. Submit in under a minute.',
    },
    {
      num: '02',
      title: 'Match',
      body: 'We pair a vetted photographer with the right pro camera for your brief.',
    },
    {
      num: '03',
      title: 'Dispatch',
      body: 'Crew heads to your location — ASAP in as little as 90 minutes*, or on schedule.',
    },
    {
      num: '04',
      title: 'Shoot',
      body: 'On-site capture with professional gear. You stay focused on the work.',
    },
    {
      num: '05',
      title: 'Deliver',
      body: 'Selects and finals land digitally — ready for web, print, and social.',
    },
  ];

  readonly valuePoints: ValuePoint[] = [
    {
      title: 'Fast dispatch',
      body: 'ASAP bookings target as little as 90 minutes*, or lock a scheduled slot when you can plan ahead.',
    },
    {
      title: 'Pro camera + photographer',
      body: 'One booking covers talent and gear — cinema, full-frame, or medium format matched to the shoot.',
    },
    {
      title: 'One booking flow',
      body: 'Shoot type, location, timing, camera preference, and brief — all in a single path to /book.',
    },
    {
      title: 'Digital delivery',
      body: 'Edited stills delivered online so your team can publish without chasing files or hard drives.',
    },
  ];

  readonly pricingPlans: PricingTeaser[] = [
    {
      name: 'Quick',
      duration: '1–2 hours',
      summary: 'Menus, portraits, product packs, quick social stills.',
      priceLabel: 'From ₹ — indicative',
      typeParam: 'Portrait',
    },
    {
      name: 'Content',
      duration: '2–4 hours',
      summary: 'Brand content days, feed sets, founder + product mixes.',
      priceLabel: 'From ₹ — indicative',
      typeParam: 'Social Media',
    },
    {
      name: 'Event',
      duration: '4–8 hours',
      summary: 'Launches, dinners, conferences, and multi-hour coverage.',
      priceLabel: 'From ₹ — indicative',
      typeParam: 'Event',
    },
  ];

  readonly heroPhoto = '/assets/background/background2.jpeg';

  /** 9-up credited grid — “Shot by X with his body” */
  readonly featuredShots: FeaturedShot[] = [
    {
      id: 'shot-1',
      photographer: 'SwamyK',
      camera: 'A7S III',
      alt: 'Low-light party dancefloor',
      image:
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'shot-2',
      photographer: 'Priya Nair',
      camera: 'α7R V',
      alt: 'Fashion editorial portrait',
      image:
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'shot-3',
      photographer: 'Arjun Mehta',
      camera: 'GFX 100S',
      alt: 'Restaurant food plate',
      image:
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'shot-4',
      photographer: 'Rahul Sharma',
      camera: 'R5',
      alt: 'Product still on clean set',
      image:
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'shot-5',
      photographer: 'Meera Iyer',
      camera: 'Z9',
      alt: 'Birthday celebration moment',
      image:
        'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'shot-6',
      photographer: 'Kabir Das',
      camera: 'FX3',
      alt: 'Brand launch crowd',
      image:
        'https://images.unsplash.com/photo-1540575467163-952df1a4c7a0?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'shot-7',
      photographer: 'Ananya Rao',
      camera: 'α7 IV',
      alt: 'Founder portrait',
      image:
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'shot-8',
      photographer: 'Vikram Shah',
      camera: 'X-T5',
      alt: 'Weekend rooftop party',
      image:
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'shot-9',
      photographer: 'SwamyK',
      camera: 'A7S III',
      alt: 'Candlelit dinner coverage',
      image:
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=700&q=80',
    },
  ];

  get bookTypeParam(): string {
    return this.quickShoot
      .replace(/ Photography$/i, '')
      .replace(/ Content$/i, '')
      .trim();
  }

  get bookQueryParams(): Record<string, string> {
    return {
      type: this.bookTypeParam,
      location: this.quickLocation,
      when: this.quickWhen,
      duration: this.quickDuration,
    };
  }

  ngOnInit(): void {
    this.seo.setPage({
      title: 'BookMyCamera — Book Photographers Hassle Free',
      description:
        'We help you book photographers hassle free. Any event, any party — express dispatch with a pro camera included.',
      path: '/',
    });
    this.loadCameras();
    this.loadPhotographers();
  }

  ngAfterViewInit(): void {
    this.setupRevealObserver();
    this.setupShotsObserver();
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
    this.revealObserver = null;
    this.shotsObserver?.disconnect();
    this.shotsObserver = null;
  }

  setDuration(value: string): void {
    this.quickDuration = value;
  }

  private loadCameras(): void {
    this.camerasLoading.set(true);
    this.cameraService
      .getAll()
      .pipe(
        catchError(() => {
          this.camerasError.set('Unable to load cameras right now.');
          return of([] as Camera[]);
        }),
      )
      .subscribe((list) => {
        this.cameras.set(list);
        this.camerasLoading.set(false);
        this.scheduleRevealRefresh();
      });
  }

  private loadPhotographers(): void {
    this.photographersLoading.set(true);
    this.photographerService
      .getAll()
      .pipe(
        catchError(() => {
          this.photographersError.set('Unable to load photographers right now.');
          return of([] as Photographer[]);
        }),
      )
      .subscribe((list) => {
        this.photographers.set(list);
        this.photographersLoading.set(false);
        this.scheduleRevealRefresh();
      });
  }

  /** Wait for Angular to paint async lists before observing .reveal nodes. */
  private scheduleRevealRefresh(): void {
    queueMicrotask(() => {
      requestAnimationFrame(() => {
        this.observeNewReveals();
        // Inventory / talent / folio must never stay invisible if observer misses
        document.querySelectorAll('.home .reveal').forEach((el) => {
          const rect = el.getBoundingClientRect();
          const inView = rect.top < window.innerHeight + 120 && rect.bottom > -120;
          if (inView) {
            el.classList.add('is-visible');
          }
        });
      });
    });
  }

  private setupRevealObserver(): void {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
      return;
    }

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.revealObserver?.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
    );
    this.observeNewReveals();
  }

  private observeNewReveals(): void {
    if (!this.revealObserver) return;
    document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
      this.revealObserver?.observe(el);
    });
  }

  private setupShotsObserver(): void {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const cards = document.querySelectorAll('.shots__card');
    if (prefersReduced) {
      cards.forEach((el) => el.classList.add('is-in'));
      return;
    }

    this.shotsObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            this.shotsObserver?.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.12 },
    );

    cards.forEach((el) => this.shotsObserver?.observe(el));
  }
}
