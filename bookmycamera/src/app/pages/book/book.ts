import {
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

import { DURATIONS, SHOOT_TYPES } from '../../core/data/mock-data';
import type {
  BookingSubmitResult,
  BookingUrgency,
  Camera,
  DurationOption,
  ShootType,
  ShootTypeOption,
} from '../../core/models';
import { BookingService } from '../../core/services/booking.service';
import { CameraService } from '../../core/services/camera.service';
import { SeoService } from '../../core/services/seo.service';
import { BmcSelect, type BmcSelectOption } from '../../shared/components/bmc-select/bmc-select';

interface WizardStep {
  index: number;
  label: string;
  title: string;
  hint: string;
  /** SVG path data for a 24×24 stroke icon. */
  icon: string;
}

interface CalendarCell {
  value: string;
  day: number;
  disabled: boolean;
  today: boolean;
}

const STEPS: WizardStep[] = [
  {
    index: 1,
    label: 'Shoot',
    title: 'What are you shooting?',
    hint: 'Pick the closest match. You can add details in your brief.',
    icon: 'M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  },
  {
    index: 2,
    label: 'Location',
    title: 'Where is the shoot?',
    hint: 'We use this to match a nearby photographer and plan the dispatch.',
    icon: 'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  },
  {
    index: 3,
    label: 'When',
    title: 'When do you need us?',
    hint: 'Go ASAP when timing is critical, or pick a preferred slot.',
    icon: 'M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
  },
  {
    index: 4,
    label: 'Camera',
    title: 'Which camera should we bring?',
    hint: 'Choose a body, or let our team pick the best kit for your brief.',
    icon: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  },
  {
    index: 5,
    label: 'Duration',
    title: 'How long is the shoot?',
    hint: 'Indicative durations. The final price is confirmed when we accept your booking.',
    icon: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  },
  {
    index: 6,
    label: 'Brief',
    title: 'Tell us about the shoot',
    hint: 'Optional, but a short brief helps us match the right photographer and kit.',
    icon: 'M4 5h16v12H8l-4 4zM8 9h8M8 13h5',
  },
  {
    index: 7,
    label: 'Review',
    title: 'Review and send',
    hint: 'Check the details below. You can edit anything before sending.',
    icon: 'M5 12.5l4.5 4.5L19 7.5',
  },
];

const SHOOT_ICONS: Record<string, string> = {
  food: 'M7 3v8a2 2 0 0 0 2 2v8M11 3v6a2 2 0 0 1-2 2M7 3v6M17 3c-1.7 0-3 2.2-3 5s1.3 4 3 4v9',
  product: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5',
  portrait: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  event: 'M5 21l3-11 6 6zM14 4l1 2M19 6l-2 1M18 11h2M10 3l.5 2M16 9l3-3',
  corporate: 'M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M9 10h.01M15 10h.01',
  'social-media': 'M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM10 10l5 3-5 3z',
  fashion: 'M9 3l3 2 3-2 5 3-2 4-2-1v12H8V9L6 10 4 6z',
  'real-estate': 'M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6',
  other: 'M12 5v14M5 12h14',
};

const DURATION_FIT: Record<number, string> = {
  1: 'Headshots, a few products or a quick social shoot',
  2: 'Menu refresh, small event or a content session',
  4: 'Half-day event, campaign or multiple setups',
  8: 'Full-day coverage, launches and big productions',
};

/** Bookable window: 06:00 to 23:00 in 30 minute steps. */
const DAY_START_MIN = 6 * 60;
const DAY_END_MIN = 23 * 60;
const SLOT_STEP_MIN = 30;
const MONTHS_AHEAD = 6;
const QUICK_LENGTHS = [1, 2, 3, 4, 6, 8];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const QUICK_CITIES = ['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad'];

const BRIEF_PROMPTS = [
  'Must-have shots: ',
  'Number of people: ',
  'Brand colours or references: ',
  'Deliverables needed: ',
];

const pad = (n: number) => String(n).padStart(2, '0');
const toDateValue = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromMinutes = (total: number): string => `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;

@Component({
  selector: 'app-book',
  imports: [ReactiveFormsModule, FormsModule, RouterLink, BmcSelect],
  templateUrl: './book.html',
  styleUrl: './book.css',
})
export class Book implements OnInit {
  private readonly booking = inject(BookingService);
  private readonly cameraService = inject(CameraService);
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  private readonly briefField = viewChild<ElementRef<HTMLTextAreaElement>>('briefField');
  private readonly topEl = viewChild<ElementRef<HTMLElement>>('top');

  readonly shootTypes: ShootTypeOption[] = SHOOT_TYPES;
  readonly durations: DurationOption[] = DURATIONS;
  readonly steps = STEPS;
  readonly totalSteps = this.booking.totalSteps;
  readonly quickCities = QUICK_CITIES;
  readonly briefPrompts = BRIEF_PROMPTS;
  readonly briefMax = 1000;

  readonly state = this.booking.state;
  readonly currentStep = this.booking.currentStep;
  readonly canProceed = this.booking.canProceed;
  readonly canGoPrev = this.booking.canGoPrev;
  readonly isLastStep = this.booking.isLastStep;

  readonly step = computed(() => STEPS[this.currentStep() - 1]);
  /** Furthest step the user has reached; earlier and reached steps are clickable. */
  readonly maxReached = signal(1);

  readonly cameras = signal<Camera[]>([]);
  readonly camerasLoading = signal(true);
  readonly camerasError = signal<string | null>(null);

  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly submitResult = signal<BookingSubmitResult | null>(null);
  readonly copied = signal(false);

  readonly selectedCamera = computed(() => {
    const id = this.state().cameraId;
    return id ? (this.cameras().find((c) => c.id === id) ?? null) : null;
  });

  /** Required details only (the brief is optional). */
  readonly requiredCount = 5;
  readonly filledCount = computed(() => {
    this.state();
    return STEPS.slice(0, this.requiredCount).filter((s) => this.booking.isStepFilled(s.index)).length;
  });
  readonly progressPct = computed(() =>
    Math.round(((this.currentStep() - 1) / (this.totalSteps - 1)) * 100),
  );

  readonly summaryRows = computed(() => {
    this.state();
    this.cameras();
    return [
      { step: 1, label: 'Shoot', value: this.state().shootType ?? '' },
      { step: 2, label: 'Location', value: this.locationLabel() },
      { step: 3, label: 'When', value: this.whenLabel() },
      { step: 4, label: 'Camera', value: this.cameraLabel() },
      { step: 5, label: 'Duration', value: this.durationLabel() },
    ];
  });

  /* ---------- Calendar ---------- */

  readonly weekdays = WEEKDAYS;
  readonly viewMonth = signal(this.monthStart(new Date()));
  readonly monthLabel = computed(() =>
    this.viewMonth().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
  );
  readonly canPrevMonth = computed(
    () => this.viewMonth().getTime() > this.monthStart(new Date()).getTime(),
  );
  readonly canNextMonth = computed(() => {
    const limit = this.monthStart(new Date());
    limit.setMonth(limit.getMonth() + MONTHS_AHEAD);
    return this.viewMonth().getTime() < limit.getTime();
  });

  /** Monday-first month grid; `null` cells pad the first week. */
  readonly calendar = computed<(CalendarCell | null)[]>(() => {
    const first = this.viewMonth();
    const todayValue = toDateValue(new Date());
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const lead = (first.getDay() + 6) % 7;
    const cells: (CalendarCell | null)[] = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= daysInMonth; d++) {
      const value = toDateValue(new Date(first.getFullYear(), first.getMonth(), d));
      cells.push({ value, day: d, disabled: value < todayValue, today: value === todayValue });
    }
    return cells;
  });

  readonly quickDates = computed(() => {
    const now = new Date();
    const at = (offset: number) =>
      toDateValue(new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset));
    const toSat = (6 - now.getDay() + 7) % 7 || 7;
    return [
      { label: 'Today', value: at(0) },
      { label: 'Tomorrow', value: at(1) },
      { label: 'This Saturday', value: at(toSat) },
      { label: 'Next week', value: at(7) },
    ];
  });

  /* ---------- Time range ---------- */

  readonly quickLengths = QUICK_LENGTHS;

  /** Earliest start allowed for the chosen date (two hours of notice for today). */
  private readonly earliestStart = computed(() => {
    if (this.state().date !== toDateValue(new Date())) return DAY_START_MIN;
    const now = new Date();
    const soon = now.getHours() * 60 + now.getMinutes() + 120;
    return Math.max(DAY_START_MIN, Math.ceil(soon / SLOT_STEP_MIN) * SLOT_STEP_MIN);
  });

  readonly fromOptions = computed<BmcSelectOption[]>(() => {
    const out: BmcSelectOption[] = [];
    for (let m = this.earliestStart(); m <= DAY_END_MIN - SLOT_STEP_MIN; m += SLOT_STEP_MIN) {
      const v = fromMinutes(m);
      out.push({ value: v, label: this.formatTime(v) });
    }
    return out;
  });

  readonly toOptions = computed<BmcSelectOption[]>(() => {
    const start = this.state().time;
    if (!start) return [];
    const out: BmcSelectOption[] = [];
    for (let m = toMinutes(start) + SLOT_STEP_MIN; m <= DAY_END_MIN; m += SLOT_STEP_MIN) {
      const v = fromMinutes(m);
      out.push({ value: v, label: this.formatTime(v), hint: this.formatHours((m - toMinutes(start)) / 60) });
    }
    return out;
  });

  readonly noSlotsToday = computed(() => this.fromOptions().length === 0);

  readonly rangeHours = computed(() => {
    const s = this.state();
    return s.time && s.endTime ? (toMinutes(s.endTime) - toMinutes(s.time)) / 60 : 0;
  });

  /** Duration cards, plus the custom length from the time range when it is not a preset. */
  readonly durationCards = computed(() => {
    const cards = this.durations.map((d) => ({ hours: d.hours, custom: false }));
    const h = this.state().durationHours;
    if (h && !cards.some((c) => c.hours === h)) cards.push({ hours: h, custom: true });
    return cards.sort((a, b) => a.hours - b.hours);
  });

  readonly missingHint = computed(() => {
    const s = this.state();
    switch (this.currentStep()) {
      case 1:
        return 'Pick a shoot type to continue';
      case 2:
        return !s.city.trim()
          ? 'Add the city to continue'
          : !s.area.trim()
            ? 'Add the area to continue'
            : 'Add the venue or address to continue';
      case 3:
        if (!s.urgency) return 'Choose ASAP or schedule a slot';
        if (!s.date) return 'Pick a date to continue';
        if (!s.time) return 'Pick a start time to continue';
        return 'Pick an end time to continue';
      case 4:
        return 'Pick a camera, or let our team choose';
      case 5:
        return 'Choose how long you need us';
      default:
        return '';
    }
  });

  readonly locationForm = this.fb.nonNullable.group({
    city: ['', [Validators.required, Validators.minLength(2)]],
    area: ['', [Validators.required, Validators.minLength(2)]],
    address: ['', [Validators.required, Validators.minLength(5)]],
  });

  constructor() {
    effect(() => {
      const current = this.currentStep();
      this.maxReached.update((m) => Math.max(m, current));
    });
  }

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Book a Shoot with BookMyCamera',
      description:
        'Book a professional photographer with a professional camera. Choose shoot type, location, timing, camera, and duration. Dispatch in as little as 90 minutes.',
      path: '/book',
    });

    this.syncLocationFormFromState();
    this.wireLocationForm();
    this.loadCameras();
    this.applyQueryParams();
  }

  shootIcon(id: string): string {
    return SHOOT_ICONS[id] ?? SHOOT_ICONS['other'];
  }

  durationFit(hours: number): string {
    return DURATION_FIT[hours] ?? '';
  }

  /* ---------- Stepper ---------- */

  isStepComplete(step: number): boolean {
    return step < this.currentStep() || (step <= this.maxReached() && this.booking.isStepFilled(step));
  }

  isStepClickable(step: number): boolean {
    if (step === this.currentStep() || step > this.maxReached()) return false;
    for (let s = 1; s < step; s++) {
      if (!this.booking.isStepFilled(s)) return false;
    }
    return true;
  }

  goToStep(step: number): void {
    if (!this.isStepClickable(step)) return;
    if (this.currentStep() === 2) this.flushLocationForm();
    this.booking.setStep(step);
    this.scrollToTop();
  }

  /** Jump from the summary or review rows to edit a step. */
  editStep(step: number): void {
    if (this.currentStep() === 2) this.flushLocationForm();
    if (step <= this.maxReached()) {
      this.booking.setStep(step);
      this.scrollToTop();
    }
  }

  next(): void {
    if (this.currentStep() === 2) this.flushLocationForm();
    if (this.booking.nextStep()) this.scrollToTop();
  }

  prev(): void {
    if (this.currentStep() === 2) this.flushLocationForm();
    if (this.booking.prevStep()) this.scrollToTop();
  }

  /* ---------- Step inputs ---------- */

  selectShootType(type: ShootType): void {
    this.booking.updateShootType(type);
  }

  setCity(city: string): void {
    this.locationForm.controls.city.setValue(city);
  }

  selectUrgency(urgency: BookingUrgency): void {
    if (urgency === 'asap') {
      this.booking.updateWhen({ urgency: 'asap', date: '', time: '', endTime: '' });
      return;
    }
    this.booking.updateUrgency('scheduled');
  }

  changeMonth(delta: number): void {
    const next = new Date(this.viewMonth());
    next.setMonth(next.getMonth() + delta);
    if (delta < 0 && !this.canPrevMonth()) return;
    if (delta > 0 && !this.canNextMonth()) return;
    this.viewMonth.set(next);
  }

  selectDate(value: string): void {
    this.booking.updateDate(value);
    if (this.state().urgency !== 'scheduled') this.booking.updateUrgency('scheduled');
    const [y, m] = value.split('-').map(Number);
    this.viewMonth.set(new Date(y, m - 1, 1));
    // Drop a start time that is no longer allowed (for example, too soon today).
    const start = this.state().time;
    if (start && toMinutes(start) < this.earliestStart()) {
      this.booking.updateWhen({ time: '', endTime: '' });
    }
  }

  setStart(value: string): void {
    if (!value) return;
    const s = this.state();
    const keepHours = s.durationHours ?? 2;
    this.booking.updateTime(value);
    if (!s.endTime || s.endTime <= value) {
      this.applyEnd(toMinutes(value) + keepHours * 60);
    } else {
      this.syncDurationFromRange();
    }
  }

  setEnd(value: string): void {
    if (!value) return;
    this.booking.updateEndTime(value);
    this.syncDurationFromRange();
  }

  setLength(hours: number): void {
    const start = this.state().time;
    if (!start) return;
    this.applyEnd(toMinutes(start) + hours * 60);
  }

  isLengthAvailable(hours: number): boolean {
    const start = this.state().time;
    return !!start && toMinutes(start) + hours * 60 <= DAY_END_MIN;
  }

  private applyEnd(endMinutes: number): void {
    this.booking.updateEndTime(fromMinutes(Math.min(endMinutes, DAY_END_MIN)));
    this.syncDurationFromRange();
  }

  private syncDurationFromRange(): void {
    const h = this.rangeHours();
    if (h > 0) this.booking.updateDurationHours(h);
  }

  selectCamera(camera: Camera): void {
    this.booking.updateCamera({ cameraId: camera.id, cameraChoice: 'specific' });
  }

  selectLetUsChoose(): void {
    this.booking.updateCamera({ cameraId: null, cameraChoice: 'let-us-choose' });
  }

  selectDuration(hours: number): void {
    this.booking.updateDurationHours(hours);
    const s = this.state();
    if (s.urgency === 'scheduled' && s.time) {
      this.booking.updateEndTime(fromMinutes(Math.min(toMinutes(s.time) + hours * 60, DAY_END_MIN)));
    }
  }

  onBriefChange(value: string): void {
    this.booking.updateBrief(value.slice(0, this.briefMax));
  }

  addPrompt(prompt: string): void {
    const current = this.state().brief;
    const next = current ? `${current.replace(/\s+$/, '')}\n${prompt}` : prompt;
    this.onBriefChange(next);
    const el = this.briefField()?.nativeElement;
    if (el) {
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      });
    }
  }

  /* ---------- Submit ---------- */

  submit(): void {
    if (this.submitting() || !this.isLastStep()) return;
    this.submitting.set(true);
    this.submitError.set(null);

    this.booking
      .submitBooking()
      .pipe(
        catchError(() =>
          of({
            success: false,
            referenceId: '',
            message: 'Something went wrong while submitting. Please try again.',
          } satisfies BookingSubmitResult),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        this.submitting.set(false);
        if (!result.success) {
          this.submitError.set(result.message || 'Unable to submit booking. Please try again.');
          this.submitResult.set(null);
          return;
        }
        this.submitResult.set(result);
        this.submitError.set(null);
        this.scrollToTop();
      });
  }

  retrySubmit(): void {
    this.submitError.set(null);
    this.submit();
  }

  copyReference(): void {
    const ref = this.submitResult()?.referenceId;
    if (!ref) return;
    navigator.clipboard?.writeText(ref).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  startNewBooking(): void {
    this.submitResult.set(null);
    this.submitError.set(null);
    this.submitting.set(false);
    this.booking.reset();
    this.maxReached.set(1);
    this.locationForm.reset({ city: '', area: '', address: '' });
  }

  /* ---------- Labels ---------- */

  locationLabel(): string {
    const s = this.state();
    return [s.area, s.city].map((p) => p.trim()).filter(Boolean).join(', ');
  }

  fullAddress(): string {
    const s = this.state();
    return [s.address, s.area, s.city].map((p) => p.trim()).filter(Boolean).join(', ');
  }

  cameraLabel(): string {
    const s = this.state();
    if (s.cameraChoice === 'let-us-choose') return 'Our team will choose';
    const cam = this.selectedCamera();
    if (cam) return cam.model;
    return '';
  }

  whenLabel(): string {
    const s = this.state();
    if (s.urgency === 'asap') return 'ASAP, today';
    if (s.urgency === 'scheduled' && s.date && s.time && s.endTime) {
      return `${this.formatDate(s.date)}, ${this.formatTime(s.time)} to ${this.formatTime(s.endTime)}`;
    }
    if (s.urgency === 'scheduled' && s.date && s.time) {
      return `${this.formatDate(s.date)} from ${this.formatTime(s.time)}`;
    }
    if (s.urgency === 'scheduled' && s.date) return this.formatDate(s.date);
    if (s.urgency === 'scheduled') return 'Scheduled';
    return '';
  }

  durationLabel(): string {
    const hours = this.state().durationHours;
    if (hours == null) return '';
    return this.formatHours(hours);
  }

  formatHours(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    const hPart = h ? `${h} ${h === 1 ? 'hour' : 'hours'}` : '';
    const mPart = m ? `${m} min` : '';
    return [hPart, mPart].filter(Boolean).join(' ');
  }

  formatDate(value: string): string {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      ...(y !== new Date().getFullYear() ? { year: 'numeric' } : {}),
    });
  }

  formatTime(value: string): string {
    const [h, m] = value.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    return `${((h + 11) % 12) + 1}:${pad(m)} ${suffix}`;
  }

  /* ---------- Internals ---------- */

  private monthStart(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  private scrollToTop(): void {
    const el = this.topEl()?.nativeElement;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 90;
    if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
  }

  private syncLocationFormFromState(): void {
    const s = this.state();
    this.locationForm.patchValue(
      { city: s.city, area: s.area, address: s.address },
      { emitEvent: false },
    );
  }

  private wireLocationForm(): void {
    this.locationForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.booking.updateLocation({
          city: value.city?.trim() ?? '',
          area: value.area?.trim() ?? '',
          address: value.address?.trim() ?? '',
        });
      });
  }

  private flushLocationForm(): void {
    const raw = this.locationForm.getRawValue();
    this.booking.updateLocation({
      city: raw.city.trim(),
      area: raw.area.trim(),
      address: raw.address.trim(),
    });
  }

  private loadCameras(): void {
    this.camerasLoading.set(true);
    this.camerasError.set(null);
    this.cameraService
      .getAll()
      .pipe(
        catchError(() => {
          this.camerasError.set('Unable to load cameras right now. Please try again.');
          return of([] as Camera[]);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((list) => {
        this.cameras.set(list);
        this.camerasLoading.set(false);
      });
  }

  private applyQueryParams(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const typeParam = params.get('type');
      if (typeParam) {
        const matched = this.resolveShootType(typeParam);
        if (matched) this.booking.updateShootType(matched);
      }

      const photographerId = params.get('photographer');
      if (photographerId?.trim()) this.booking.updatePhotographerId(photographerId.trim());

      const cameraSlug = params.get('camera');
      if (cameraSlug?.trim()) this.prefillCameraBySlug(cameraSlug.trim());
    });
  }

  private resolveShootType(raw: string): ShootType | null {
    const normalized = raw.trim().toLowerCase().replace(/[_]+/g, '-');
    const byId = this.shootTypes.find(
      (t) => t.id === normalized || t.id === normalized.replace(/\s+/g, '-'),
    );
    if (byId) return byId.label;
    const byLabel = this.shootTypes.find(
      (t) =>
        t.label.toLowerCase() === normalized || t.label.toLowerCase() === raw.trim().toLowerCase(),
    );
    return byLabel?.label ?? null;
  }

  private prefillCameraBySlug(slug: string): void {
    this.cameraService
      .getBySlug(slug)
      .pipe(catchError(() => of(null)), takeUntilDestroyed(this.destroyRef))
      .subscribe((camera) => {
        if (!camera) return;
        this.booking.updateCamera({ cameraId: camera.id, cameraChoice: 'specific' });
        this.cameras.update((list) =>
          list.some((c) => c.id === camera.id) ? list : [camera, ...list],
        );
      });
  }
}
