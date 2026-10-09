import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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

interface WizardStepMeta {
  index: number;
  label: string;
  shortLabel: string;
}

@Component({
  selector: 'app-book',
  imports: [ReactiveFormsModule, RouterLink],
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

  readonly shootTypes: ShootTypeOption[] = SHOOT_TYPES;
  readonly durations: DurationOption[] = DURATIONS;
  readonly totalSteps = this.booking.totalSteps;

  readonly steps: WizardStepMeta[] = [
    { index: 1, label: 'Shoot', shortLabel: 'Shoot' },
    { index: 2, label: 'Location', shortLabel: 'Loc' },
    { index: 3, label: 'When', shortLabel: 'When' },
    { index: 4, label: 'Camera', shortLabel: 'Cam' },
    { index: 5, label: 'Duration', shortLabel: 'Dur' },
    { index: 6, label: 'Brief', shortLabel: 'Brief' },
    { index: 7, label: 'Review', shortLabel: 'Review' },
  ];

  readonly state = this.booking.state;
  readonly currentStep = this.booking.currentStep;
  readonly canProceed = this.booking.canProceed;
  readonly canGoPrev = this.booking.canGoPrev;
  readonly isLastStep = this.booking.isLastStep;

  readonly cameras = signal<Camera[]>([]);
  readonly camerasLoading = signal(true);
  readonly camerasError = signal<string | null>(null);

  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly submitResult = signal<BookingSubmitResult | null>(null);

  readonly selectedCamera = computed(() => {
    const id = this.state().cameraId;
    if (!id) {
      return null;
    }
    return this.cameras().find((c) => c.id === id) ?? null;
  });

  readonly locationForm = this.fb.nonNullable.group({
    city: ['', [Validators.required, Validators.minLength(2)]],
    area: ['', [Validators.required, Validators.minLength(2)]],
    address: ['', [Validators.required, Validators.minLength(5)]],
  });

  constructor() {
    // Booking state lives in BookingService so it can persist across navigation
    // (e.g. opening a camera detail mid-flow). Reset only via startNewBooking().
  }

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Book a Shoot — BookMyCamera',
      description:
        'Book a professional photographer with a professional camera. Choose shoot type, location, timing, camera, and duration — dispatch in as little as 90 minutes.',
      path: '/book',
    });

    this.syncLocationFormFromState();
    this.wireLocationForm();
    this.loadCameras();
    this.applyQueryParams();
  }

  stepTitle(step = this.currentStep()): string {
    switch (step) {
      case 1:
        return 'What are you shooting?';
      case 2:
        return 'Where is the shoot?';
      case 3:
        return 'When do you need it?';
      case 4:
        return 'Which camera?';
      case 5:
        return 'How long is the shoot?';
      case 6:
        return 'Tell us about the shoot.';
      case 7:
        return 'Ready to book?';
      default:
        return 'Book a shoot';
    }
  }

  stepHint(step = this.currentStep()): string {
    switch (step) {
      case 1:
        return 'Pick the closest match — you can refine details in your brief.';
      case 2:
        return 'We use this to match a nearby photographer and plan dispatch.';
      case 3:
        return 'ASAP when timing is critical, or schedule a preferred slot.';
      case 4:
        return 'Choose a body, or let our team pick the best kit for the brief.';
      case 5:
        return 'Indicative durations — final pricing is confirmed on booking.';
      case 6:
        return 'A short brief helps us match the right photographer and kit.';
      case 7:
        return 'Confirm the details below, then send your booking request.';
      default:
        return '';
    }
  }

  isStepClickable(step: number): boolean {
    return this.canGoPrev() && step < this.currentStep();
  }

  isStepComplete(step: number): boolean {
    return step < this.currentStep();
  }

  isStepCurrent(step: number): boolean {
    return step === this.currentStep();
  }

  goToStep(step: number): void {
    if (!this.isStepClickable(step)) {
      return;
    }
    this.booking.setStep(step);
  }

  selectShootType(type: ShootType): void {
    this.booking.updateShootType(type);
  }

  selectUrgency(urgency: BookingUrgency): void {
    if (urgency === 'asap') {
      this.booking.updateWhen({ urgency: 'asap', date: '', time: '' });
      return;
    }
    this.booking.updateUrgency('scheduled');
  }

  onDateChange(value: string): void {
    this.booking.updateDate(value);
    if (this.state().urgency !== 'scheduled') {
      this.booking.updateUrgency('scheduled');
    }
  }

  onTimeChange(value: string): void {
    this.booking.updateTime(value);
    if (this.state().urgency !== 'scheduled') {
      this.booking.updateUrgency('scheduled');
    }
  }

  selectCamera(camera: Camera): void {
    this.booking.updateCamera({
      cameraId: camera.id,
      cameraChoice: 'specific',
    });
  }

  selectLetUsChoose(): void {
    this.booking.updateCamera({
      cameraId: null,
      cameraChoice: 'let-us-choose',
    });
  }

  selectDuration(hours: number): void {
    this.booking.updateDurationHours(hours);
  }

  onBriefChange(value: string): void {
    this.booking.updateBrief(value);
  }

  next(): void {
    if (this.currentStep() === 2) {
      this.flushLocationForm();
    }
    this.booking.nextStep();
  }

  prev(): void {
    this.booking.prevStep();
  }

  submit(): void {
    if (this.submitting() || !this.isLastStep()) {
      return;
    }

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
          this.submitError.set(
            result.message || 'Unable to submit booking. Please try again.',
          );
          this.submitResult.set(null);
          return;
        }
        this.submitResult.set(result);
        this.submitError.set(null);
      });
  }

  retrySubmit(): void {
    this.submitError.set(null);
    this.submit();
  }

  startNewBooking(): void {
    this.submitResult.set(null);
    this.submitError.set(null);
    this.submitting.set(false);
    this.booking.reset();
    this.locationForm.reset({ city: '', area: '', address: '' });
  }

  locationLabel(): string {
    const s = this.state();
    const parts = [s.area, s.city].map((p) => p.trim()).filter(Boolean);
    if (parts.length === 0) {
      return '';
    }
    return parts.join(', ');
  }

  cameraLabel(): string {
    const s = this.state();
    if (s.cameraChoice === 'let-us-choose') {
      return 'Let our team choose';
    }
    const cam = this.selectedCamera();
    if (cam) {
      return `${cam.brand} ${cam.model}`;
    }
    return s.cameraId ?? '—';
  }

  whenLabel(): string {
    const s = this.state();
    if (s.urgency === 'asap') {
      return 'ASAP';
    }
    if (s.urgency === 'scheduled' && s.date && s.time) {
      return `${s.date} at ${s.time}`;
    }
    if (s.urgency === 'scheduled') {
      return 'Scheduled';
    }
    return '—';
  }

  durationLabel(): string {
    const hours = this.state().durationHours;
    if (hours == null) {
      return '—';
    }
    return this.durations.find((d) => d.hours === hours)?.label ?? `${hours} Hours`;
  }

  minDate(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
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
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const typeParam = params.get('type');
        if (typeParam) {
          const matched = this.resolveShootType(typeParam);
          if (matched) {
            this.booking.updateShootType(matched);
          }
        }

        const photographerId = params.get('photographer');
        if (photographerId?.trim()) {
          this.booking.updatePhotographerId(photographerId.trim());
        }

        const cameraSlug = params.get('camera');
        if (cameraSlug?.trim()) {
          this.prefillCameraBySlug(cameraSlug.trim());
        }
      });
  }

  private resolveShootType(raw: string): ShootType | null {
    const normalized = raw.trim().toLowerCase().replace(/[_]+/g, '-');
    const byId = this.shootTypes.find(
      (t) => t.id === normalized || t.id === normalized.replace(/\s+/g, '-'),
    );
    if (byId) {
      return byId.label;
    }
    const byLabel = this.shootTypes.find(
      (t) => t.label.toLowerCase() === normalized || t.label.toLowerCase() === raw.trim().toLowerCase(),
    );
    return byLabel?.label ?? null;
  }

  private prefillCameraBySlug(slug: string): void {
    this.cameraService
      .getBySlug(slug)
      .pipe(
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((camera) => {
        if (!camera) {
          return;
        }
        this.booking.updateCamera({
          cameraId: camera.id,
          cameraChoice: 'specific',
        });
        this.cameras.update((list) =>
          list.some((c) => c.id === camera.id) ? list : [camera, ...list],
        );
      });
  }
}
