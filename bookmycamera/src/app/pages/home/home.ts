import {
  Component,
  ElementRef,
  OnInit,
  computed,
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
  meta: string;
  /** SVG path data for a 24×24 stroke icon. */
  icon: string;
}

interface ValuePoint {
  title: string;
  body: string;
  /** SVG path data for a 24×24 stroke icon. */
  icon: string;
  chips: string[];
}

interface DispatchStep {
  time: string;
  label: string;
  detail: string;
}

interface PricingTeaser {
  name: string;
  duration: string;
  summary: string;
  priceLabel: string;
  typeParam: string;
}

interface Reel {
  /** Position from the centre of the curved screen (…, -1, 0, 1, …). */
  offset: number;
  direction: 'up' | 'down';
  durationS: number;
  /** Frames repeated twice so the loop is seamless. */
  loop: string[];
}

const REEL_PHOTO_IDS = [
  'photo-1414235077428-338989a2e8c0',
  'photo-1516035069371-29a1b244cc32',
  'photo-1531746020798-e6953c6e8e04',
  'photo-1514525253161-7a46d19cd819',
  'photo-1523275335684-37898b6baf30',
  'photo-1469334031218-e382a71b716b',
  'photo-1502920917128-1aa500764cbd',
  'photo-1600880292203-757bb62b4baf',
  'photo-1530103862676-de8c9debad1d',
  'photo-1606983340126-99ab4feaa64a',
  'photo-1560250097-0b93528c311a',
  'photo-1492684223066-81342ee5ff30',
  'photo-1510127034890-ba27508e9f1c',
  'photo-1511795409834-ef04bbd61622',
  'photo-1526170375885-4d8ecf77b99f',
  'photo-1600596542815-ffad4c1539a9',
  'photo-1617005082133-548c4dd27f35',
  'photo-1504674900247-0877df9cc836',
  'photo-1492691527719-9d1e07e534b4',
  'photo-1517248135467-4c7edcad34c4',
  'photo-1485846234645-a62644f84728',
  'photo-1507003211169-0a1dd7228f2d',
  'photo-1554048612-b6a482bc67e5',
  'photo-1494790108377-be9c29b29330',
];

const REEL_COUNT = 9;
const FRAMES_PER_REEL = 5;

const reelImage = (id: string): string =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=420&h=540&q=60`;

const buildReels = (): Reel[] =>
  Array.from({ length: REEL_COUNT }, (_, i) => {
    const frames = Array.from({ length: FRAMES_PER_REEL }, (_, f) =>
      reelImage(REEL_PHOTO_IDS[(i * 3 + f * 5) % REEL_PHOTO_IDS.length]),
    );
    return {
      offset: i - (REEL_COUNT - 1) / 2,
      direction: i % 2 === 0 ? 'up' : 'down',
      durationS: 70 + ((i * 7) % 25),
      loop: [...frames, ...frames],
    };
  });

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
export class Home implements OnInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly seo = inject(SeoService);
  private readonly cameraService = inject(CameraService);
  private readonly photographerService = inject(PhotographerService);


  readonly cameras = signal<Camera[]>([]);
  readonly camerasLoading = signal(true);
  readonly camerasError = signal<string | null>(null);
  readonly activeCamIndex = signal(0);
  readonly activeCatIndex = signal(0);
  readonly activeCam = computed(() => this.cameras()[this.activeCamIndex()] ?? null);

  readonly photographers = signal<Photographer[]>([]);
  readonly photographersLoading = signal(true);
  readonly photographersError = signal<string | null>(null);
  readonly talentAvailableOnly = signal(false);
  readonly availableTodayCount = computed(
    () => this.photographers().filter((p) => p.availableToday).length,
  );
  readonly visiblePhotographers = computed(() =>
    this.talentAvailableOnly()
      ? this.photographers().filter((p) => p.availableToday)
      : this.photographers(),
  );

  quickShoot = 'Food Photography';
  quickLocation = 'Indiranagar, Bengaluru';
  quickWhen = 'Today, ASAP';
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
    { value: 'Indiranagar, Bengaluru', label: 'Indiranagar, Bengaluru', hint: 'Popular, fast dispatch' },
    { value: 'Koramangala, Bengaluru', label: 'Koramangala, Bengaluru' },
    { value: 'HSR Layout, Bengaluru', label: 'HSR Layout, Bengaluru' },
    { value: 'Whitefield, Bengaluru', label: 'Whitefield, Bengaluru' },
    { value: 'Bandra, Mumbai', label: 'Bandra, Mumbai' },
    { value: 'Andheri, Mumbai', label: 'Andheri, Mumbai' },
    { value: 'Connaught Place, Delhi', label: 'Connaught Place, Delhi' },
    { value: 'Jubilee Hills, Hyderabad', label: 'Jubilee Hills, Hyderabad' },
  ];

  readonly whenSelectOptions = [
    { value: 'Today, ASAP', label: 'Today, ASAP', hint: 'Crew on location in as little as 90 minutes' },
    { value: 'Today, evening', label: 'Today, evening', hint: 'After 5 PM' },
    { value: 'Tomorrow, morning', label: 'Tomorrow, morning' },
    { value: 'Tomorrow, afternoon', label: 'Tomorrow, afternoon' },
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
    'Any event, any party',
    'Express dispatch',
    'Pro camera included',
  ];

  readonly opsMetrics: OpsMetric[] = [
    { value: '4', label: 'Cities live', note: 'Bengaluru, Mumbai, Delhi, Hyderabad' },
    { value: '90 min', label: 'ASAP dispatch target', note: 'In serviced city areas' },
    { value: '2,400+', label: 'Shoots fulfilled', note: 'Demo network volume' },
    {
      value: String(CAMERAS.length),
      label: 'Pro cameras in network',
      note: CAMERA_BRANDS.join(', '),
    },
  ];

  readonly shootCategories: ShootCategory[] = [
    {
      title: 'Food',
      type: 'Food',
      slug: 'food-photography',
      useCases: 'Menus, restaurants, delivery apps and social plates',
      image:
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Product',
      type: 'Product',
      slug: 'product-photography',
      useCases: 'Packaging, ecommerce, launches and lifestyle',
      image:
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Portrait',
      type: 'Portrait',
      slug: 'portrait-photography',
      useCases: 'Founders, headshots and personal brand',
      image:
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Event',
      type: 'Event',
      slug: 'event-photography',
      useCases: 'Launches, dinners, conferences and nights out',
      image:
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Corporate',
      type: 'Corporate',
      slug: 'corporate-photography',
      useCases: 'Teams, offices, leadership and press kits',
      image:
        'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Social',
      type: 'Social Media',
      slug: 'social-media-content',
      useCases: 'Feed stills, reels frames and creator content',
      image:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Fashion',
      type: 'Fashion',
      slug: 'fashion-photography',
      useCases: 'Lookbooks, editorial and campaign stills',
      image:
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Real Estate',
      type: 'Real Estate',
      slug: 'real-estate-photography',
      useCases: 'Interiors, listings and hospitality spaces',
      image:
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80',
    },
  ];

  readonly howSteps: HowStep[] = [
    {
      num: '01',
      title: 'Book',
      body: 'Pick shoot type, location, timing, and duration. Submit in under a minute.',
      meta: 'Under a minute',
      icon: 'M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
    },
    {
      num: '02',
      title: 'Match',
      body: 'We pair a vetted photographer with the right pro camera for your brief.',
      meta: 'Vetted crew + gear',
      icon: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a6 6 0 0 1 12 0M16 11l2 2 4-4',
    },
    {
      num: '03',
      title: 'Dispatch',
      body: 'Crew heads to your location ASAP, in as little as 90 minutes, or on schedule.',
      meta: 'ASAP or scheduled',
      icon: 'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    },
    {
      num: '04',
      title: 'Shoot',
      body: 'On-site capture with professional gear. You stay focused on the work.',
      meta: 'Pro gear on-site',
      icon: 'M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    },
    {
      num: '05',
      title: 'Deliver',
      body: 'Selects and finals land digitally, ready for web, print, and social.',
      meta: 'Web, print, social',
      icon: 'M12 4v11M7 10l5 5 5-5M5 20h14',
    },
  ];

  readonly valuePoints: ValuePoint[] = [
    {
      title: 'Fast dispatch',
      body: 'ASAP bookings put a crew at your location in as little as 90 minutes, or lock a scheduled slot when you can plan ahead.',
      icon: 'M13 2L4 14h7l-1 8 9-12h-7z',
      chips: ['ASAP', 'Scheduled'],
    },
    {
      title: 'Pro camera + photographer',
      body: 'One booking covers talent and gear, with cinema, full-frame, or medium format matched to the shoot.',
      icon: 'M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      chips: ['Cinema', 'Full-frame', 'Medium format', 'Lenses + lighting'],
    },
    {
      title: 'One booking flow',
      body: 'Shoot type, location, timing, camera preference, and brief, all in one simple booking.',
      icon: 'M4 6h16M4 12h10M4 18h6M17 15l2 2 3-4',
      chips: ['Type', 'Place', 'Time', 'Brief'],
    },
    {
      title: 'Digital delivery',
      body: 'Edited stills delivered online so your team can publish without chasing files or hard drives.',
      icon: 'M7 18a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 9.5a4 4 0 0 1-1 7.9M12 12v8M9 17l3 3 3-3',
      chips: ['Web', 'Print', 'Social'],
    },
  ];

  /** Sample ASAP booking built from the live camera and photographer data. */
  readonly dispatchSample = computed(() => {
    const photographer =
      this.photographers().find((p) => p.availableToday) ?? this.photographers()[0] ?? null;
    const camera =
      this.cameras().find((c) => c.brand === 'Sony') ?? this.cameras()[0] ?? null;
    const steps: DispatchStep[] = [
      { time: '2:00 PM', label: 'Booking confirmed', detail: 'Food shoot, 2 hours, Indiranagar' },
      {
        time: '2:10 PM',
        label: 'Crew assigned',
        detail:
          photographer && camera
            ? `${photographer.name} with ${camera.model}`
            : 'Vetted photographer with a pro camera',
      },
      { time: '3:30 PM', label: 'Crew on location', detail: 'Shoot starts as booked' },
    ];
    return { photographer, steps };
  });

  readonly pricingPlans: PricingTeaser[] = [
    {
      name: 'Quick',
      duration: '1 to 2 hours',
      summary: 'Menus, portraits, product packs, quick social stills.',
      priceLabel: 'Indicative price',
      typeParam: 'Portrait',
    },
    {
      name: 'Content',
      duration: '2 to 4 hours',
      summary: 'Brand content days, feed sets, founder + product mixes.',
      priceLabel: 'Indicative price',
      typeParam: 'Social Media',
    },
    {
      name: 'Event',
      duration: '4 to 8 hours',
      summary: 'Launches, dinners, conferences, and multi-hour coverage.',
      priceLabel: 'Indicative price',
      typeParam: 'Event',
    },
  ];

  readonly reels: Reel[] = buildReels();

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
        'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&w=700&q=80',
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
      title: 'BookMyCamera: Book Photographers Hassle Free',
      description:
        'We help you book photographers hassle free. Any event, any party, with express dispatch and a pro camera included.',
      path: '/',
    });
    this.loadCameras();
    this.loadPhotographers();
  }

  setDuration(value: string): void {
    this.quickDuration = value;
  }

  selectCamera(index: number, focus = false): void {
    this.activeCamIndex.set(index);
    setTimeout(() => this.revealActivePick(focus));
  }

  stepCamera(delta: number, focus = false): void {
    const count = this.cameras().length;
    if (!count) return;
    this.selectCamera((this.activeCamIndex() + delta + count) % count, focus);
  }

  /** Scrolls only the picker list (never the page) so the active camera is visible. */
  private revealActivePick(focus: boolean): void {
    const picker = this.host.nativeElement.querySelector<HTMLElement>('.gear__picker');
    const pick = picker?.querySelector<HTMLElement>('.gear__pick.is-active');
    if (!picker || !pick) return;
    if (focus) pick.focus({ preventScroll: true });
    const p = picker.getBoundingClientRect();
    const r = pick.getBoundingClientRect();
    const pad = 12;
    if (r.top < p.top) picker.scrollTop -= p.top - r.top + pad;
    else if (r.bottom > p.bottom) picker.scrollTop += r.bottom - p.bottom + pad;
    if (r.left < p.left) picker.scrollLeft -= p.left - r.left + pad;
    else if (r.right > p.right) picker.scrollLeft += r.right - p.right + pad;
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
      });
  }
}
