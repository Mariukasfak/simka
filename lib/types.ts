// Print area types
export type PrintAreaPosition = 'front' | 'back' | 'left-sleeve' | 'right-sleeve';

export interface PrintArea {
  id: string;
  name: string;
  position: PrintAreaPosition;
  maxWidth: number;
  maxHeight: number;
  bounds: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

// Design types
export interface Design {
  id: string;
  imageUrl: string;
  position: { x: number; y: number };
  scale: number;
  opacity: number;
  rotation: number;
  printArea: PrintAreaPosition;
  confirmed: boolean;
}

export interface DesignState {
  position: { x: number; y: number };
  scale: number;
  opacity: number;
  rotation: number;
  printArea: PrintAreaPosition;
  confirmed: boolean;
}

export interface DesignPosition {
  x: number;
  y: number;
}

// Product types
export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  type: 'hoodie' | 'tshirt';
  color: 'light' | 'dark';
  price: number;
  description?: string; // Pridedame aprašymo lauką kaip neprivalomą
}

export interface ProductColor {
  id: string;
  name: string;
  hexCode: string;
}

// Form types
export interface OrderFormData {
  name: string;
  email: string;
  phone?: string;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  quantity: number;
  comments?: string;
  printAreas: PrintAreaPosition[];
}

// Admin dashboards types
export interface Order {
  id: string;
  customerName: string;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  totalPrice: number;
  createdAt: string;
}

export interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  popularProducts: {
    productId: string;
    name: string;
    count: number;
  }[];
  dailyRevenue: {
    date: string;
    revenue: number;
  }[];
  recentOrders: Order[];
}