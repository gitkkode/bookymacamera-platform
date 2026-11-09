import { products, type Product } from '../../../utils/productsData';
import type { GearCategory, GearItem } from '../models';

const PLACEHOLDER_SHORT_DESCRIPTION = 'for more details, contact us';

export const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

interface CategoryMeta {
  key: string;
  label: string;
  blurb: string;
  icon: string;
}

/** Display order and copy for the raw `category` values in productsData.js. */
const CATEGORY_META: Record<string, CategoryMeta> = {
  Camera: {
    key: 'cameras',
    label: 'Cameras',
    blurb: 'Cinema and mirrorless bodies for video and stills.',
    icon: 'M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  },
  'Camera Combo': {
    key: 'combos',
    label: 'Camera Combos',
    blurb: 'Bodies bundled with lenses, ready to shoot out of the case.',
    icon: 'M3 7h11v10H3zM14 10l7-3v10l-7-3',
  },
  Lens: {
    key: 'lenses',
    label: 'Lenses',
    blurb: 'Primes, zooms and cine glass across every major mount.',
    icon: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 3v5M21 12h-5',
  },
  Lights: {
    key: 'lighting',
    label: 'Lighting',
    blurb: 'LED panels, strobes, modifiers, triggers and reflectors.',
    icon: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z',
  },
  Gimbal: {
    key: 'gimbals',
    label: 'Gimbals & Rigs',
    blurb: 'Stabilisers, cranes and shoulder rigs for moving shots.',
    icon: 'M12 3v4M8 7h8l-1 5H9zM12 12v5M7 21h10M9 17h6',
  },
  Audio: {
    key: 'audio',
    label: 'Audio',
    blurb: 'Wireless mics, recorders, booms and on-set comms.',
    icon: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3',
  },
  Monitor: {
    key: 'monitors',
    label: 'Monitors & Video',
    blurb: 'Field monitors, transmitters, streaming and prompters.',
    icon: 'M3 5h18v11H3zM8 20h8M12 16v4',
  },
  Filter: {
    key: 'filters',
    label: 'Filters & Adapters',
    blurb: 'ND filters, matte boxes, step rings and mount adapters.',
    icon: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM5.6 5.6l12.8 12.8',
  },
  Tripod: {
    key: 'support',
    label: 'Tripods & Sliders',
    blurb: 'Tripods, monopods and cine sliders for locked-off and tracking shots.',
    icon: 'M12 3v6M9 9h6M12 9l-6 12M12 9l6 12M12 9v12',
  },
  Studio: {
    key: 'studio',
    label: 'Studio',
    blurb: 'Complete studio setups for portraits, products and content.',
    icon: 'M3 21V8l9-5 9 5v13M9 21v-6h6v6',
  },
  Accessories: {
    key: 'grip',
    label: 'Grip & Accessories',
    blurb: 'Flags, frames, backdrops, stands and arms.',
    icon: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM16.5 13v7M13 16.5h7',
  },
};

const FALLBACK_ICON = 'M4 7h16v13H4zM9 7V4h6v3';

/** Brands detected from product names (the header rows in the data are not reliable). */
const BRAND_RULES: Array<[RegExp, string]> = [
  [/^red\b/i, 'RED'],
  [/^sony\b/i, 'Sony'],
  [/^canon\b/i, 'Canon'],
  [/^nikon\b/i, 'Nikon'],
  [/^sigma\b/i, 'Sigma'],
  [/^cp2\b/i, 'Zeiss'],
  [/^(dji|dgi)\b/i, 'DJI'],
  [/^(road|rode)\b/i, 'Rode'],
  [/sennheiser/i, 'Sennheiser'],
  [/^shure\b/i, 'Shure'],
  [/\bzoom\b/i, 'Zoom'],
  [/baofeng/i, 'Baofeng'],
  [/aputure|^amar[oa]n\b/i, 'Aputure'],
  [/godox/i, 'Godox'],
  [/nanlite/i, 'Nanlite'],
  [/^arri\b/i, 'ARRI'],
  [/elinch/i, 'Elinchrom'],
  [/harison/i, 'Harison'],
  [/lilliput/i, 'Lilliput'],
  [/^yolo/i, 'YoloLiv'],
  [/^cvw\b/i, 'CVW'],
  [/hollyland/i, 'Hollyland'],
  [/tiffen/i, 'Tiffen'],
  [/tilta/i, 'Tilta'],
  [/redrock/i, 'Redrock'],
  [/^h y\b/i, 'H&Y'],
  [/metabase|metabones/i, 'Metabones'],
  [/manfrotto/i, 'Manfrotto'],
  [/e-image/i, 'E-Image'],
];

/** Product-type groups for unbranded items. */
const TYPE_RULES: Array<[RegExp, string]> = [
  [/\bnd\b/i, 'ND filters'],
  [/octa|softbox|parabolic/i, 'Softboxes'],
  [/cutter/i, 'Flags & cutters'],
  [/skimmer|frame/i, 'Frames & skimmers'],
  [/cloth/i, 'Backdrop cloths'],
  [/stand|rod|arm/i, 'Stands & arms'],
  [/reflector|umbrella/i, 'Reflectors & umbrellas'],
  [/bulp|bulb|panel/i, 'Practical lights'],
  [/slider/i, 'Sliders'],
  [/tripod/i, 'Tripods'],
  [/rig|mount|cren|crane/i, 'Rigs & cranes'],
  [/teleprompter/i, 'Teleprompters'],
  [/ring|adapter/i, 'Rings & adapters'],
  [/studio|dsc/i, 'Studio setups'],
];

const detectGroup = (name: string): { label: string; isBrand: boolean } => {
  for (const [re, brand] of BRAND_RULES) {
    if (re.test(name)) return { label: brand, isBrand: true };
  }
  for (const [re, type] of TYPE_RULES) {
    if (re.test(name)) return { label: type, isBrand: false };
  }
  return { label: 'Other', isBrand: false };
};

const metaFor = (rawCategory: string): CategoryMeta =>
  CATEGORY_META[rawCategory] ?? {
    key: slugify(rawCategory),
    label: rawCategory,
    blurb: `Browse ${rawCategory.toLowerCase()} available to rent.`,
    icon: FALLBACK_ICON,
  };

const cleanName = (name: string): string => name.trim().replace(/\s+/g, ' ');

const buildGear = (): GearItem[] => {
  const items: GearItem[] = [];
  const usedSlugs = new Set<string>();

  products.forEach((entry, index) => {
    if (entry.type === 'header') return;
    const product = entry as Product;
    const meta = metaFor(product.category);
    const name = cleanName(product.name);
    const group = detectGroup(name);

    let slug = slugify(name) || `item-${index}`;
    if (usedSlugs.has(slug)) slug = `${slug}-${meta.key}`;
    for (let n = 2; usedSlugs.has(slug); n++) slug = `${slugify(name)}-${meta.key}-${n}`;
    usedSlugs.add(slug);

    const shortRaw = product.ShortDescription?.trim() ?? '';
    items.push({
      key: `${meta.key}-${product.id}-${index}`,
      sourceId: product.id,
      slug,
      categoryKey: meta.key,
      categoryLabel: meta.label,
      group: group.label,
      groupSlug: slugify(group.label),
      isBrand: group.isBrand,
      name,
      image: encodeURI(product.image),
      price: product.price,
      originalPrice: Math.max(product.originalPrice, product.price),
      // The source `discount` field does not match its own prices, so derive it.
      discount:
        product.originalPrice > product.price
          ? Math.floor(((product.originalPrice - product.price) / product.originalPrice) * 100)
          : 0,
      rating: product.rating,
      reviews: product.reviews,
      shortDescription:
        shortRaw && shortRaw.toLowerCase() !== PLACEHOLDER_SHORT_DESCRIPTION ? shortRaw : null,
      description: product.fullDescription?.trim() ?? '',
      features: product.features ?? [],
      specifications: Object.entries(product.specifications ?? {}).map(([label, value]) => ({
        label,
        value: String(value),
      })),
    });
  });

  return items;
};

export const GEAR: GearItem[] = buildGear();

const buildCategories = (): GearCategory[] => {
  const order = Object.values(CATEGORY_META).map((m) => m.key);
  const byKey = new Map<string, GearCategory>();

  for (const item of GEAR) {
    let cat = byKey.get(item.categoryKey);
    if (!cat) {
      const meta = Object.values(CATEGORY_META).find((m) => m.key === item.categoryKey) ?? {
        key: item.categoryKey,
        label: item.categoryLabel,
        blurb: `Browse ${item.categoryLabel.toLowerCase()} available to rent.`,
        icon: FALLBACK_ICON,
      };
      cat = { ...meta, count: 0, groups: [], cover: item.image };
      byKey.set(item.categoryKey, cat);
    }
    cat.count++;
    const group = cat.groups.find((g) => g.slug === item.groupSlug);
    if (group) group.count++;
    else cat.groups.push({ slug: item.groupSlug, label: item.group, count: 1, isBrand: item.isBrand });
  }

  for (const cat of byKey.values()) {
    // Brands first (largest first), then type groups, "Other" last.
    cat.groups.sort((a, b) => {
      if (a.label === 'Other') return 1;
      if (b.label === 'Other') return -1;
      if (a.isBrand !== b.isBrand) return a.isBrand ? -1 : 1;
      return b.count - a.count;
    });
  }

  const rank = (key: string) => {
    const i = order.indexOf(key);
    return i === -1 ? order.length : i;
  };
  return [...byKey.values()].sort((a, b) => rank(a.key) - rank(b.key));
};

export const GEAR_CATEGORIES: GearCategory[] = buildCategories();

export const GEAR_BRAND_COUNT = new Set(GEAR.filter((g) => g.isBrand).map((g) => g.group)).size;
