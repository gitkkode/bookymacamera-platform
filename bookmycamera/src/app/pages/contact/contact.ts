import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { catchError, of } from 'rxjs';

import { ContactService } from '../../core/services/contact.service';
import { SeoService } from '../../core/services/seo.service';
import type { ContactEnquiryType } from '../../core/models';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { BmcButton } from '../../shared/components/bmc-button/bmc-button';

interface EnquiryOption {
  value: ContactEnquiryType;
  label: string;
}

@Component({
  selector: 'app-contact',
  imports: [RouterLink, ReactiveFormsModule, RevealDirective, BmcButton],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly contactService = inject(ContactService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly submitting = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly phoneDisplay = '+91 90000 00000';
  readonly phoneHref = 'tel:+919000000000';
  readonly whatsappHref = 'https://wa.me/919000000000';
  readonly emailDisplay = 'hello@bookmycamera.com';
  readonly emailHref = 'mailto:hello@bookmycamera.com';

  readonly enquiryOptions: EnquiryOption[] = [
    { value: 'general', label: 'General' },
    { value: 'business', label: 'Business enquiry' },
    { value: 'photographer', label: 'Photographer enquiry' },
    { value: 'corporate', label: 'Corporate enquiry' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'support', label: 'Support' },
  ];

  readonly pathways = [
    {
      title: 'Business',
      body: 'Menus, product drops, brand content, and growth campaigns.',
      type: 'business' as ContactEnquiryType,
    },
    {
      title: 'Photographer',
      body: 'Join the network — tell us your specialities and cities.',
      type: 'photographer' as ContactEnquiryType,
    },
    {
      title: 'Corporate',
      body: 'Retainers, multi-location, events, and campaign planning.',
      type: 'corporate' as ContactEnquiryType,
    },
  ];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(8)]],
    enquiryType: this.fb.nonNullable.control<ContactEnquiryType>('general', {
      validators: [Validators.required],
    }),
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Contact',
      description:
        'Call, WhatsApp, or email BookMyCamera. Send a business, photographer, or corporate enquiry — or book a shoot.',
      path: '/contact',
    });

    this.route.queryParamMap.subscribe((params) => {
      const raw = (params.get('type') ?? '').trim().toLowerCase();
      if (!raw) {
        return;
      }
      const match = this.enquiryOptions.find((o) => o.value === raw);
      if (match) {
        this.form.controls.enquiryType.setValue(match.value);
      }
    });
  }

  selectPathway(type: ContactEnquiryType): void {
    this.form.controls.enquiryType.setValue(type);
    const el = document.getElementById('contact-form');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  submit(): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const value = this.form.getRawValue();

    this.contactService
      .submit(value)
      .pipe(
        catchError(() =>
          of({
            success: false,
            message: 'Something went wrong sending your message. Please try again.',
          }),
        ),
      )
      .subscribe((result) => {
        this.submitting.set(false);
        if (result.success) {
          this.successMessage.set(result.message);
          this.form.reset({
            name: '',
            email: '',
            phone: '',
            enquiryType: 'general',
            message: '',
          });
          return;
        }
        this.errorMessage.set(result.message);
      });
  }

  controlInvalid(name: 'name' | 'email' | 'phone' | 'enquiryType' | 'message'): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }
}
