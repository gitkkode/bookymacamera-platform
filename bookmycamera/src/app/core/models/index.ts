/** Shared domain models for BookMyCamera frontend. */

export type ShootType =
  | 'Food'
  | 'Product'
  | 'Portrait'
  | 'Event'
  | 'Corporate'
  | 'Social Media'
  | 'Fashion'
  | 'Real Estate'
  | 'Other';

export type PortfolioCategory = 'Food' | 'People' | 'Products' | 'Events' | 'Brands';

export type BookingUrgency = 'asap' | 'scheduled';

export type CameraChoice = 'specific' | 'let-us-choose';

export type ContactEnquiryType =
  | 'general'
  | 'business'
  | 'photographer'
  | 'corporate'
  | 'partnership'
  | 'support';

export interface Camera {
  id: string;
  slug: string;
  brand: string;
  model: string;
  category: string;
  shortDescription: string;
  description: string;
  image: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  features: string[];
  specifications: { label: string; value: string }[];
}

export interface Photographer {
  id: string;
  slug: string;
  name: string;
  specialities: string[];
  rating: number;
  shoots: number;
  availableToday: boolean;
  location: string;
  image: string;
  experience: string;
  bio: string;
  portfolio: string[];
}

export interface ServiceFaq {
  q: string;
  a: string;
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  useCases: string[];
  included: string[];
  faqs: ServiceFaq[];
  image: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  duration: string;
  features: string[];
  /** Display label such as "From ₹X", "Custom", or an indicative placeholder. */
  priceLabel: string;
  isPlaceholder: boolean;
  cta: string;
}

export interface PortfolioItem {
  id: string;
  category: PortfolioCategory;
  image: string;
  alt: string;
  caption: string;
}

export interface BookingState {
  shootType: ShootType | null;
  city: string;
  area: string;
  address: string;
  urgency: BookingUrgency | null;
  date: string;
  time: string;
  cameraId: string | null;
  cameraChoice: CameraChoice | null;
  durationHours: number | null;
  brief: string;
  photographerId?: string | null;
  estimatedPrice?: number | null;
}

export interface ContactEnquiry {
  name: string;
  email: string;
  phone: string;
  enquiryType: ContactEnquiryType;
  message: string;
}

export interface DurationOption {
  hours: number;
  label: string;
  /** Optional indicative price label; replace when live pricing is available. */
  priceLabel?: string;
}

export interface ShootTypeOption {
  id: string;
  label: ShootType;
  description: string;
}

export interface BookingSubmitResult {
  success: boolean;
  referenceId: string;
  message: string;
}

export interface ContactSubmitResult {
  success: boolean;
  message: string;
}
