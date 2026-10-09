import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';

import type { ContactEnquiry, ContactSubmitResult } from '../models';

@Injectable({ providedIn: 'root' })
export class ContactService {
  /**
   * Mock contact submission. Swap for HTTP when the contact API is ready.
   */
  submit(enquiry: ContactEnquiry): Observable<ContactSubmitResult> {
    return of(enquiry).pipe(
      delay(500),
      map(() => ({
        success: true,
        message: 'Thanks — we received your message and will get back to you soon.',
      })),
    );
  }
}
