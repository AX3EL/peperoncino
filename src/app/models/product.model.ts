export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  available: boolean;
  emoji: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Booking {
  id: string;
  customerName: string;
  customerSurname: string;
  customerPhone: string;
  items: CartItem[];
  total: number;
  date: Date;
  status: 'pending' | 'confirmed' | 'ready' | 'completed';
}
