export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  type: 'hoodie' | 'tshirt' | 'cap' | 'bag' | 'mug';
  color: 'light' | 'dark';
  availableSizes: string[];
  price: number;
  description: string;
  printAreas: PrintArea[];
  materials: Material[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrintArea {
  id: string;
  name: string;
  position: 'front' | 'back' | 'sleeve' | 'side';
  top: string;
  left: string;
  width: string;
  height: string;
}

export interface Material {
  id: string;
  name: string;
  description: string;
  composition: string;
  weight: string;
  price: number;
}

export interface DesignPosition {
  x: number;
  y: number;
}

export interface DesignState {
  imageFile: File | null;
  imageUrl: string;
  position: DesignPosition;
  scale: number;
  opacity: number;
  printArea: PrintArea;
}

export interface FormData {
  name: string;
  email: string;
  comments: string;
}

export interface Order {
  id: string;
  userId: string | null;
  productId: string;
  designUrl: string;
  quantity: number;
  size: string;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  customerName: string;
  customerEmail: string;
  comments: string;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  popularProducts: Array<{
    productId: string;
    name: string;
    count: number;
  }>;
  recentOrders: Order[];
  dailyRevenue: Array<{
    date: string;
    revenue: number;
  }>;
}

export interface SubmissionResult {
  success: boolean;
  message: string;
}

export interface DesignSubmission {
  product: Product;
  designState: DesignState;
  formData: FormData;
}