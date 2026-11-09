import type { Camera, GearItem } from '../models';
import { GEAR } from './catalogue';

const toCamera = (item: GearItem): Camera => ({
  id: `cam-${item.sourceId}`,
  slug: item.slug,
  brand: item.group,
  model: item.name,
  category: 'Camera',
  shortDescription: item.shortDescription ?? '',
  description: item.description,
  image: item.image,
  price: item.price,
  originalPrice: item.originalPrice,
  discount: item.discount,
  rating: item.rating,
  reviews: item.reviews,
  features: item.features,
  specifications: item.specifications,
});

/** Camera bodies only — used by the home spotlight and the booking flow. */
export const CAMERAS: Camera[] = GEAR.filter((g) => g.categoryKey === 'cameras').map(toCamera);

export const CAMERA_BRANDS: string[] = [...new Set(CAMERAS.map((c) => c.brand))];
