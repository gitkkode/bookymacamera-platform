import { Injectable, computed, signal } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';

import type {
  BookingState,
  BookingSubmitResult,
  BookingUrgency,
  CameraChoice,
  ShootType,
} from '../models';

const TOTAL_STEPS = 7;

const INITIAL_STATE: BookingState = {
  shootType: null,
  city: '',
  area: '',
  address: '',
  urgency: null,
  date: '',
  time: '',
  cameraId: null,
  cameraChoice: null,
  durationHours: null,
  brief: '',
  photographerId: null,
  estimatedPrice: null,
};

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly _state = signal<BookingState>({ ...INITIAL_STATE });
  private readonly _currentStep = signal(1);

  readonly state = this._state.asReadonly();
  readonly currentStep = this._currentStep.asReadonly();
  readonly totalSteps = TOTAL_STEPS;

  readonly canProceed = computed(() => this.isStepValid(this._currentStep(), this._state()));

  readonly canGoPrev = computed(() => this._currentStep() > 1);

  readonly isLastStep = computed(() => this._currentStep() >= TOTAL_STEPS);

  updateShootType(shootType: ShootType | null): void {
    this.patch({ shootType });
  }

  updateCity(city: string): void {
    this.patch({ city });
  }

  updateArea(area: string): void {
    this.patch({ area });
  }

  updateAddress(address: string): void {
    this.patch({ address });
  }

  updateLocation(partial: Pick<BookingState, 'city' | 'area' | 'address'>): void {
    this.patch(partial);
  }

  updateUrgency(urgency: BookingUrgency | null): void {
    this.patch({ urgency });
  }

  updateDate(date: string): void {
    this.patch({ date });
  }

  updateTime(time: string): void {
    this.patch({ time });
  }

  updateWhen(
    partial: Pick<BookingState, 'urgency' | 'date' | 'time'>,
  ): void {
    this.patch(partial);
  }

  updateCameraId(cameraId: string | null): void {
    this.patch({ cameraId });
  }

  updateCameraChoice(cameraChoice: CameraChoice | null): void {
    this.patch({ cameraChoice });
  }

  updateCamera(partial: Pick<BookingState, 'cameraId' | 'cameraChoice'>): void {
    this.patch(partial);
  }

  updateDurationHours(durationHours: number | null): void {
    this.patch({ durationHours });
  }

  updateBrief(brief: string): void {
    this.patch({ brief });
  }

  updatePhotographerId(photographerId: string | null): void {
    this.patch({ photographerId });
  }

  updateEstimatedPrice(estimatedPrice: number | null): void {
    this.patch({ estimatedPrice });
  }

  patch(partial: Partial<BookingState>): void {
    this._state.update((current) => ({ ...current, ...partial }));
  }

  reset(): void {
    this._state.set({ ...INITIAL_STATE });
    this._currentStep.set(1);
  }

  setStep(step: number): void {
    this._currentStep.set(this.clampStep(step));
  }

  nextStep(): boolean {
    if (!this.canProceed()) {
      return false;
    }
    if (this._currentStep() < TOTAL_STEPS) {
      this._currentStep.update((s) => s + 1);
    }
    return true;
  }

  prevStep(): boolean {
    if (this._currentStep() <= 1) {
      return false;
    }
    this._currentStep.update((s) => s - 1);
    return true;
  }

  /**
   * Submits the current booking state as a mock success response.
   * Replace with a real API call when the backend booking endpoint is available.
   */
  submitBooking(): Observable<BookingSubmitResult> {
    const snapshot = this._state();
    return of(snapshot).pipe(
      delay(600),
      map(() => ({
        success: true,
        referenceId: `BMC-${Date.now().toString(36).toUpperCase()}`,
        message:
          'Booking request received. Our team will confirm availability and pricing shortly.',
      })),
    );
  }

  private isStepValid(step: number, state: BookingState): boolean {
    switch (step) {
      case 1:
        return state.shootType != null;
      case 2:
        return (
          state.city.trim().length > 0 &&
          state.area.trim().length > 0 &&
          state.address.trim().length > 0
        );
      case 3:
        if (state.urgency === 'asap') {
          return true;
        }
        if (state.urgency === 'scheduled') {
          return state.date.trim().length > 0 && state.time.trim().length > 0;
        }
        return false;
      case 4:
        if (state.cameraChoice === 'let-us-choose') {
          return true;
        }
        if (state.cameraChoice === 'specific') {
          return !!state.cameraId;
        }
        return false;
      case 5:
        return state.durationHours != null && state.durationHours > 0;
      case 6:
        // Brief is encouraged but optional so users can proceed quickly.
        return true;
      case 7:
        return true;
      default:
        return false;
    }
  }

  private clampStep(step: number): number {
    if (!Number.isFinite(step)) {
      return 1;
    }
    return Math.min(TOTAL_STEPS, Math.max(1, Math.trunc(step)));
  }
}
