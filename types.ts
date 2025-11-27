export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  heightClass: string; // To create the masonry effect variation
}

export type ProductUpdate = Partial<Omit<Product, 'id'>>;
