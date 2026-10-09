export interface ProductHeader {
  type: 'header';
  brand: string;
  category: string;
}

export interface Product {
  type?: undefined;
  id: number;
  name: string;
  category: string;
  originalPrice: number;
  price: number;
  ShortDescription: string;
  discount: number;
  rating: number;
  reviews: number;
  image: string;
  fullDescription: string;
  features: string[];
  specifications: Record<string, string>;
}

export declare const products: Array<ProductHeader | Product>;
