import { products, type Product } from '../../../utils/productsData';
import type { Camera } from '../models';

const CAMERA_CATEGORY = 'Camera';

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Header brands are lower-case labels like "red camera" or "sony". */
const formatBrand = (raw: string): string => {
  const name = raw.trim().replace(/\s+camera$/i, '');
  if (name.length <= 3) {
    return name.toUpperCase();
  }
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

const toCamera = (product: Product, brand: string): Camera => ({
  id: `cam-${product.id}`,
  slug: slugify(product.name),
  brand,
  model: product.name.trim(),
  category: product.category,
  shortDescription: product.ShortDescription,
  description: product.fullDescription,
  image: encodeURI(product.image),
  price: product.price,
  originalPrice: product.originalPrice,
  discount: product.discount,
  rating: product.rating,
  reviews: product.reviews,
  features: product.features,
  specifications: Object.entries(product.specifications).map(([label, value]) => ({
    label,
    value,
  })),
});

const buildCameras = (): Camera[] => {
  const cameras: Camera[] = [];
  let currentBrand = '';
  for (const item of products) {
    if (item.type === 'header') {
      if (item.category === CAMERA_CATEGORY) {
        currentBrand = formatBrand(item.brand);
      }
      continue;
    }
    if (item.category === CAMERA_CATEGORY) {
      cameras.push(toCamera(item, currentBrand));
    }
  }
  return cameras;
};

export const CAMERAS: Camera[] = buildCameras();

export const CAMERA_BRANDS: string[] = [...new Set(CAMERAS.map((c) => c.brand))];
