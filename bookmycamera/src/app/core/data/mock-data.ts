import type {
  DurationOption,
  Photographer,
  PortfolioItem,
  PricingPlan,
  ServiceItem,
  ShootTypeOption,
} from '../models';

/** Unsplash helper — consistent sizing for catalogue imagery. */
const u = (photoId: string, w = 800): string =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${w}&q=80`;

export const SHOOT_TYPES: ShootTypeOption[] = [
  {
    id: 'food',
    label: 'Food',
    description: 'Menus, restaurants, delivery platforms, and social food content.',
  },
  {
    id: 'product',
    label: 'Product',
    description: 'E-commerce packs, packshots, and lifestyle product imagery.',
  },
  {
    id: 'portrait',
    label: 'Portrait',
    description: 'Founder, team, and personal branding portraits.',
  },
  {
    id: 'event',
    label: 'Event',
    description: 'Launches, parties, conferences, and live coverage.',
  },
  {
    id: 'corporate',
    label: 'Corporate',
    description: 'Office, leadership, and brand storytelling for businesses.',
  },
  {
    id: 'social-media',
    label: 'Social Media',
    description: 'Reels-ready stills and short-form content for channels.',
  },
  {
    id: 'fashion',
    label: 'Fashion',
    description: 'Lookbooks, apparel, and editorial fashion shoots.',
  },
  {
    id: 'real-estate',
    label: 'Real Estate',
    description: 'Property interiors, exteriors, and listing photography.',
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Tell us what you need — we will match the right setup.',
  },
];

export const DURATIONS: DurationOption[] = [
  { hours: 1, label: '1 Hour', priceLabel: 'Indicative — confirm on booking' },
  { hours: 2, label: '2 Hours', priceLabel: 'Indicative — confirm on booking' },
  { hours: 4, label: '4 Hours', priceLabel: 'Indicative — confirm on booking' },
  { hours: 8, label: '8 Hours', priceLabel: 'Indicative — confirm on booking' },
];

/**
 * Demo photographer profiles for UI development.
 * These are fictional placeholders — not real BookMyCamera freelancers.
 */
export const PHOTOGRAPHERS: Photographer[] = [
  {
    id: 'ph-arjun-mehta',
    slug: 'arjun-mehta',
    name: 'Arjun Mehta',
    specialities: ['Food', 'Lifestyle', 'Portrait'],
    rating: 4.9,
    shoots: 128,
    availableToday: true,
    location: 'Mumbai',
    image: u('photo-1507003211169-0a1dd7228f2d'),
    experience: '8 years',
    bio: 'Demo profile. Food and lifestyle specialist with a clean, commercial aesthetic. Available for restaurant launches and brand content in Mumbai.',
    portfolio: [
      u('photo-1414235077428-338989a2e8c0'),
      u('photo-1504674900247-0877df9cc836'),
      u('photo-1517248135467-4c7edcad34c4'),
    ],
  },
  {
    id: 'ph-priya-nair',
    slug: 'priya-nair',
    name: 'Priya Nair',
    specialities: ['Fashion', 'Portrait', 'Editorial'],
    rating: 5.0,
    shoots: 96,
    availableToday: true,
    location: 'Bengaluru',
    image: u('photo-1494790108377-be9c29b29330'),
    experience: '7 years',
    bio: 'Demo profile. Fashion and editorial photographer focused on lookbooks, apparel campaigns, and founder portraits.',
    portfolio: [
      u('photo-1469334031218-e382a71b716b'),
      u('photo-1483985988355-763728e1935b'),
      u('photo-1515886657613-9f3515b0c78f'),
    ],
  },
  {
    id: 'ph-rahul-sharma',
    slug: 'rahul-sharma',
    name: 'Rahul Sharma',
    specialities: ['Product', 'E-commerce', 'Studio'],
    rating: 4.8,
    shoots: 210,
    availableToday: false,
    location: 'Delhi NCR',
    image: u('photo-1472099645785-5658abf4ff4e'),
    experience: '10 years',
    bio: 'Demo profile. Studio product specialist for D2C brands and marketplaces. Precision lighting and packshot workflows.',
    portfolio: [
      u('photo-1523275335684-37898b6baf30'),
      u('photo-1505740420928-5e560c06d30e'),
      u('photo-1572635196237-14b3f281503f'),
    ],
  },
  {
    id: 'ph-ananya-iyer',
    slug: 'ananya-iyer',
    name: 'Ananya Iyer',
    specialities: ['Events', 'Corporate', 'Social Media'],
    rating: 4.7,
    shoots: 84,
    availableToday: true,
    location: 'Hyderabad',
    image: u('photo-1438761681033-6461ffad8d80'),
    experience: '5 years',
    bio: 'Demo profile. Fast-turnaround event and corporate coverage with social-ready deliverables.',
    portfolio: [
      u('photo-1540575467163-952df1a4c7a0'),
      u('photo-1511578314322-379afb476865'),
      u('photo-1475721027785-f74eccf877e2'),
    ],
  },
  {
    id: 'ph-vikram-singh',
    slug: 'vikram-singh',
    name: 'Vikram Singh',
    specialities: ['Real Estate', 'Architecture', 'Interior'],
    rating: 4.8,
    shoots: 152,
    availableToday: false,
    location: 'Pune',
    image: u('photo-1500648767791-00dcc994a43e'),
    experience: '9 years',
    bio: 'Demo profile. Real estate and interior photographer for listings, hospitality, and property marketing.',
    portfolio: [
      u('photo-1600596542815-ffad4c1539a9'),
      u('photo-1600585154340-be6161a56a0c'),
      u('photo-1560448204-e02f11c3d0e2'),
    ],
  },
  {
    id: 'ph-meera-kapoor',
    slug: 'meera-kapoor',
    name: 'Meera Kapoor',
    specialities: ['Brand', 'Campaign', 'Commercial'],
    rating: 4.9,
    shoots: 67,
    availableToday: true,
    location: 'Mumbai',
    image: u('photo-1544005313-94ddf0286df2'),
    experience: '6 years',
    bio: 'Demo profile. Brand campaign photographer for startups and agencies. Concept-driven commercial storytelling.',
    portfolio: [
      u('photo-1441986300917-64674bd600d8'),
      u('photo-1556742049-0cfed4f6a45d'),
      u('photo-1557804506-669a67965ba0'),
    ],
  },
  {
    id: 'ph-karthik-reddy',
    slug: 'karthik-reddy',
    name: 'Karthik Reddy',
    specialities: ['Food', 'Product', 'Social Media'],
    rating: 4.7,
    shoots: 113,
    availableToday: true,
    location: 'Chennai',
    image: u('photo-1519085360753-af0119f7cbe7'),
    experience: '6 years',
    bio: 'Demo profile. Food and product content for Instagram, menus, and quick-commerce platforms.',
    portfolio: [
      u('photo-1476224203421-9ac39bcb3327'),
      u('photo-1565299624946-b28f40a0ae38'),
      u('photo-1567620905732-2d1ec7ab7445'),
    ],
  },
  {
    id: 'ph-sneha-patel',
    slug: 'sneha-patel',
    name: 'Sneha Patel',
    specialities: ['Portrait', 'Corporate', 'Founder'],
    rating: 5.0,
    shoots: 75,
    availableToday: false,
    location: 'Ahmedabad',
    image: u('photo-1534528741775-53994a69daeb'),
    experience: '7 years',
    bio: 'Demo profile. Corporate and founder portraits with a natural, approachable look for LinkedIn and press kits.',
    portfolio: [
      u('photo-1560250097-0b93528c311a'),
      u('photo-1573496359142-b8d87734a5a2'),
      u('photo-1551836022-d5d88e9218df'),
    ],
  },
];

export const SERVICES: ServiceItem[] = [
  {
    id: 'svc-food',
    slug: 'food-photography',
    title: 'Food Photography',
    shortTitle: 'Food',
    description:
      'Restaurant-ready imagery for menus, delivery platforms, and social channels. We bring professional lighting and cameras to your kitchen or dining floor.',
    useCases: [
      'Restaurant shoots',
      'Menus',
      'Delivery platforms',
      'Social content',
      'Chef portraits',
      'Opening campaigns',
    ],
    included: [
      'Professional photographer',
      'Professional camera & lighting',
      'On-location shoot',
      'Curated digital delivery',
      'Basic colour correction',
    ],
    faqs: [
      {
        q: 'Do you shoot on location at my restaurant?',
        a: 'Yes. Most food shoots happen at your venue so dishes look authentic in context. Studio options can be arranged for packshots.',
      },
      {
        q: 'How many dishes can we cover in a session?',
        a: 'It depends on plating complexity and duration. A 2-hour session typically covers a focused hero set; longer bookings suit full menus.',
      },
      {
        q: 'Can images be optimized for Swiggy or Zomato?',
        a: 'Yes. Tell us your platforms in the brief and we will frame and deliver accordingly.',
      },
    ],
    image: u('photo-1414235077428-338989a2e8c0'),
  },
  {
    id: 'svc-product',
    slug: 'product-photography',
    title: 'Product Photography',
    shortTitle: 'Product',
    description:
      'Clean packshots and lifestyle product imagery for e-commerce, D2C brands, and marketplaces — on location or in a controlled setup.',
    useCases: [
      'E-commerce packs',
      'Lifestyle product shots',
      'Amazon / Flipkart imagery',
      'Launch creatives',
      'Packaging detail',
    ],
    included: [
      'Professional photographer',
      'Camera matched to product detail',
      'Lighting setup',
      'Multiple angles as scoped',
      'Digital delivery',
    ],
    faqs: [
      {
        q: 'Do you offer white-background packshots?',
        a: 'Yes. Specify packshot vs lifestyle in your brief so we match lighting and backdrop.',
      },
      {
        q: 'Can you shoot reflective or jewellery products?',
        a: 'Yes, with appropriate lighting control. Mention materials in advance so we bring the right modifiers.',
      },
      {
        q: 'How are files delivered?',
        a: 'Digitally after the shoot, typically as high-resolution stills ready for web and marketplace use.',
      },
    ],
    image: u('photo-1523275335684-37898b6baf30'),
  },
  {
    id: 'svc-portrait',
    slug: 'portrait-photography',
    title: 'Portrait Photography',
    shortTitle: 'Portrait',
    description:
      'Founder, team, and personal branding portraits for LinkedIn, press, and company pages — natural or directed styles.',
    useCases: [
      'Founder portraits',
      'Team headshots',
      'Personal branding',
      'Press kits',
      'LinkedIn profiles',
    ],
    included: [
      'Professional photographer',
      'Professional camera',
      'Guided posing support',
      'On-location or simple backdrop',
      'Retouched select frames',
    ],
    faqs: [
      {
        q: 'Can you shoot multiple people in one session?',
        a: 'Yes. Book a duration that fits your headcount — team shoots usually need 2–4 hours.',
      },
      {
        q: 'Do you provide wardrobe guidance?',
        a: 'We can share simple prep tips. For full styling, mention it in your brief.',
      },
      {
        q: 'Indoor or outdoor?',
        a: 'Either. Share location preferences and lighting constraints when you book.',
      },
    ],
    image: u('photo-1560250097-0b93528c311a'),
  },
  {
    id: 'svc-event',
    slug: 'event-photography',
    title: 'Event Photography',
    shortTitle: 'Event',
    description:
      'Coverage for launches, conferences, parties, and brand activations — candid moments and key speeches included.',
    useCases: [
      'Product launches',
      'Conferences',
      'Parties & celebrations',
      'Brand activations',
      'Award nights',
    ],
    included: [
      'Professional photographer',
      'Event-ready camera setup',
      'Coverage for booked duration',
      'Highlight selects',
      'Digital gallery delivery',
    ],
    faqs: [
      {
        q: 'Can you cover evening or low-light venues?',
        a: 'Yes. We match cameras and lenses suited to dim environments when you note venue lighting.',
      },
      {
        q: 'Do you offer same-day social selects?',
        a: 'Possible for many events — request rush social selects in your brief so we plan accordingly.',
      },
      {
        q: 'Can I book more than one photographer?',
        a: 'For large venues or multi-room events, ask our team when you enquire or book Custom coverage.',
      },
    ],
    image: u('photo-1540575467163-952df1a4c7a0'),
  },
  {
    id: 'svc-corporate',
    slug: 'corporate-photography',
    title: 'Corporate Photography',
    shortTitle: 'Corporate',
    description:
      'Office culture, leadership, and brand storytelling for companies that need professional visuals on a tight timeline.',
    useCases: [
      'Office culture',
      'Leadership portraits',
      'Brand storytelling',
      'Annual reports',
      'Internal communications',
    ],
    included: [
      'Professional photographer',
      'Professional camera',
      'On-site coordination',
      'Curated delivery set',
      'Commercial usage framing',
    ],
    faqs: [
      {
        q: 'Can you work around office schedules?',
        a: 'Yes. Share preferred windows and we will plan efficient coverage around meetings.',
      },
      {
        q: 'Do you shoot multi-location offices?',
        a: 'Supported via Custom / corporate packages — contact the team for multi-site planning.',
      },
      {
        q: 'NDA available?',
        a: 'We can discuss confidentiality requirements for sensitive workplaces. Note it in your enquiry.',
      },
    ],
    image: u('photo-1497366216548-37526070297c'),
  },
  {
    id: 'svc-social',
    slug: 'social-media-content',
    title: 'Social Media Content',
    shortTitle: 'Social Media',
    description:
      'Reels-ready stills and short-form content packages for Instagram, YouTube, and brand channels.',
    useCases: [
      'Instagram content',
      'Reels stills',
      'Creator collabs',
      'Monthly content batches',
      'Campaign assets',
    ],
    included: [
      'Professional photographer',
      'Camera suited to content',
      'Platform-aware framing',
      'Batch of deliverables',
      'Quick-turn selects option',
    ],
    faqs: [
      {
        q: 'Do you shoot vertical and square crops?',
        a: 'Yes. Tell us your primary platforms and aspect ratios in the brief.',
      },
      {
        q: 'Is video included?',
        a: 'Stills are standard. Short-form motion can be scoped — mention it when booking.',
      },
      {
        q: 'Can this be a recurring monthly shoot?',
        a: 'Yes. Corporate and Custom plans support recurring content calendars.',
      },
    ],
    image: u('photo-1611162616475-46b635cb6868'),
  },
  {
    id: 'svc-fashion',
    slug: 'fashion-photography',
    title: 'Fashion Photography',
    shortTitle: 'Fashion',
    description:
      'Lookbooks, apparel campaigns, and editorial fashion with professional lighting and camera systems.',
    useCases: [
      'Lookbooks',
      'Apparel campaigns',
      'Editorial sets',
      'E-commerce fashion',
      'Model tests',
    ],
    included: [
      'Professional photographer',
      'High-resolution camera option',
      'Lighting for fashion',
      'Directed shoot support',
      'Curated edit set',
    ],
    faqs: [
      {
        q: 'Do you provide models or stylists?',
        a: 'Typically client-arranged. We can advise on crew needs if you ask in advance.',
      },
      {
        q: 'Studio or location?',
        a: 'Both work. Share your concept and we will recommend the right setup.',
      },
      {
        q: 'Can images be used commercially?',
        a: 'Commercial usage is assumed for brand bookings; confirm any model/release needs with your team.',
      },
    ],
    image: u('photo-1469334031218-e382a71b716b'),
  },
  {
    id: 'svc-real-estate',
    slug: 'real-estate-photography',
    title: 'Real Estate Photography',
    shortTitle: 'Real Estate',
    description:
      'Property interiors, exteriors, and listing photography that helps homes and commercial spaces sell or lease faster.',
    useCases: [
      'Property listings',
      'Interior showcases',
      'Hospitality spaces',
      'Architecture highlights',
      'Broker marketing',
    ],
    included: [
      'Professional photographer',
      'Wide-angle capable setup',
      'Interior & exterior coverage',
      'Straightened architectural frames',
      'Digital delivery for listings',
    ],
    faqs: [
      {
        q: 'How long does a typical flat take?',
        a: 'A compact apartment often fits in 1–2 hours; villas and commercial spaces need longer.',
      },
      {
        q: 'Do you shoot twilight exteriors?',
        a: 'Yes, when scheduled. Book a later slot and note twilight preference in the brief.',
      },
      {
        q: 'Virtual staging included?',
        a: 'Not by default. Ask our team if you need staging or floor-plan add-ons.',
      },
    ],
    image: u('photo-1600596542815-ffad4c1539a9'),
  },
  {
    id: 'svc-brand',
    slug: 'brand-campaigns',
    title: 'Brand Campaigns',
    shortTitle: 'Brand Campaigns',
    description:
      'Concept-driven campaign photography for launches, seasonal pushes, and multi-asset brand storytelling.',
    useCases: [
      'Campaign launches',
      'Seasonal creatives',
      'Multi-asset sets',
      'Agency collaborations',
      'Hero key visuals',
    ],
    included: [
      'Professional photographer',
      'Camera matched to campaign needs',
      'Creative coordination support',
      'Hero + supporting frames',
      'Campaign-ready delivery',
    ],
    faqs: [
      {
        q: 'Can you work from a creative brief or moodboard?',
        a: 'Yes — share moodboards, references, and must-have shots when you book.',
      },
      {
        q: 'Multi-day campaigns?',
        a: 'Supported under Custom planning. Talk to our team for multi-day or multi-location shoots.',
      },
      {
        q: 'Who owns the images?',
        a: 'Usage terms are confirmed at booking. Brand campaigns typically include commercial usage for scoped deliverables.',
      },
    ],
    image: u('photo-1557804506-669a67965ba0'),
  },
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'plan-quick',
    name: 'Quick Shoot',
    duration: '1 hour',
    features: [
      'Professional photographer',
      'Professional camera',
      'Digital delivery',
      'Ideal for focused hero shots',
    ],
    priceLabel: 'From ₹ — Indicative — confirm on booking',
    isPlaceholder: true,
    cta: 'BOOK NOW',
  },
  {
    id: 'plan-content',
    name: 'Content Shoot',
    duration: '2 hours',
    features: [
      'Professional photographer',
      'Camera + lenses',
      'Edited photographs',
      'Great for social & product sets',
    ],
    priceLabel: 'From ₹ — Indicative — confirm on booking',
    isPlaceholder: true,
    cta: 'BOOK NOW',
  },
  {
    id: 'plan-event',
    name: 'Event',
    duration: '4 hours',
    features: [
      'Professional photographer',
      'Professional camera',
      'Event coverage',
      'Highlight selects',
    ],
    priceLabel: 'From ₹ — Indicative — confirm on booking',
    isPlaceholder: true,
    cta: 'BOOK NOW',
  },
  {
    id: 'plan-custom',
    name: 'Custom',
    duration: 'Flexible',
    features: [
      'Corporate & campaigns',
      'Multi-location',
      'Monthly content',
      'Tailored crew & kit',
    ],
    priceLabel: 'Custom',
    isPlaceholder: true,
    cta: 'Talk to us',
  },
];

export const PORTFOLIO: PortfolioItem[] = [
  {
    id: 'pf-01',
    category: 'Food',
    image: u('photo-1414235077428-338989a2e8c0'),
    alt: 'Plated restaurant dish on a dark table',
    caption: 'Demo gallery — restaurant plating',
  },
  {
    id: 'pf-02',
    category: 'Food',
    image: u('photo-1504674900247-0877df9cc836'),
    alt: 'Colourful plated meal overhead',
    caption: 'Demo gallery — food overhead',
  },
  {
    id: 'pf-03',
    category: 'Food',
    image: u('photo-1476224203421-9ac39bcb3327'),
    alt: 'Fresh ingredients and plated food',
    caption: 'Demo gallery — ingredients story',
  },
  {
    id: 'pf-04',
    category: 'People',
    image: u('photo-1560250097-0b93528c311a'),
    alt: 'Professional portrait of a business person',
    caption: 'Demo gallery — founder portrait',
  },
  {
    id: 'pf-05',
    category: 'People',
    image: u('photo-1573496359142-b8d87734a5a2'),
    alt: 'Corporate headshot of a professional',
    caption: 'Demo gallery — corporate portrait',
  },
  {
    id: 'pf-06',
    category: 'People',
    image: u('photo-1534528741775-53994a69daeb'),
    alt: 'Lifestyle portrait outdoors',
    caption: 'Demo gallery — lifestyle portrait',
  },
  {
    id: 'pf-07',
    category: 'Products',
    image: u('photo-1523275335684-37898b6baf30'),
    alt: 'Product packshot of a wristwatch',
    caption: 'Demo gallery — product packshot',
  },
  {
    id: 'pf-08',
    category: 'Products',
    image: u('photo-1505740420928-5e560c06d30e'),
    alt: 'Headphones product photography',
    caption: 'Demo gallery — consumer electronics',
  },
  {
    id: 'pf-09',
    category: 'Products',
    image: u('photo-1572635196237-14b3f281503f'),
    alt: 'Sunglasses product still life',
    caption: 'Demo gallery — lifestyle product',
  },
  {
    id: 'pf-10',
    category: 'Events',
    image: u('photo-1540575467163-952df1a4c7a0'),
    alt: 'Conference audience and stage',
    caption: 'Demo gallery — conference coverage',
  },
  {
    id: 'pf-11',
    category: 'Events',
    image: u('photo-1511578314322-379afb476865'),
    alt: 'Networking event crowd',
    caption: 'Demo gallery — brand activation',
  },
  {
    id: 'pf-12',
    category: 'Events',
    image: u('photo-1475721027785-f74eccf877e2'),
    alt: 'Speaker on stage at an event',
    caption: 'Demo gallery — keynote moment',
  },
  {
    id: 'pf-13',
    category: 'Brands',
    image: u('photo-1441986300917-64674bd600d8'),
    alt: 'Retail brand store interior',
    caption: 'Demo gallery — brand environment',
  },
  {
    id: 'pf-14',
    category: 'Brands',
    image: u('photo-1556742049-0cfed4f6a45d'),
    alt: 'Brand retail shopping scene',
    caption: 'Demo gallery — retail campaign',
  },
  {
    id: 'pf-15',
    category: 'Brands',
    image: u('photo-1557804506-669a67965ba0'),
    alt: 'Creative team collaborating on a campaign',
    caption: 'Demo gallery — campaign storytelling',
  },
];
