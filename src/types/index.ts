export type ProductCategory = 'all' | 'phones' | 'fashion';

export interface Product {
  id: string;
  title: string;
  category: 'phones' | 'fashion';
  subCategory?: string;
  description: string;
  price: number; // in DZD
  image: string;
  inStock: boolean;
  createdAt: number;
  badge?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface CustomerOrder {
  id: string; // e.g. RLZ-48-9281
  customerName: string;
  phone: string;
  wilaya: string;
  wilayaCode: string;
  commune: string;
  address: string;
  deliveryType: 'home' | 'desk';
  deliveryFee: number;
  items: CartItem[];
  subtotal: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  notes?: string;
}

export type Theme = 'dark' | 'light';
export type ViewMode = 'responsive' | 'mobile';
export type Language = 'ar' | 'en';
