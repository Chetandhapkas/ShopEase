export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  active?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  gender: 'Men' | 'Women' | 'Unisex';
  price: number;
  originalPrice: number;
  discount: number;
  sizes: string[];
  colors: string[];
  stockQuantity: number;
  images: string[];
  rating: number;
  reviewsCount: number;
  active: boolean;
  isTrending?: boolean;
  isNewArrival?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartPopulatedItem {
  productId: string;
  product: Product;
  size?: string;
  color?: string;
  quantity: number;
  subtotal: number;
  inStock: boolean;
}

export interface CartResponse {
  userId: string;
  items: CartPopulatedItem[];
  subtotal: number;
  totalItems: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minPurchase: number;
  maxDiscount: number;
  expiryDate: string;
  active: boolean;
  description: string;
  usageCount?: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  houseStreet: string;
  city: string;
  state: string;
  pinCode: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  size?: string;
  color?: string;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  couponCode?: string;
  couponDiscount: number;
  deliveryCharge: number;
  tax: number;
  totalAmount: number;
  paymentMethod: 'COD' | 'UPI' | 'CARD' | 'NET_BANKING';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  orderStatus: 'PLACED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockProductsCount: number;
  pendingOrdersCount: number;
  lowStockProducts: Product[];
  recentOrders: Order[];
}

export interface FilterParams {
  search?: string;
  category?: string;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  brand?: string;
  inStock?: boolean;
  sort?: string;
  trending?: boolean;
  newArrivals?: boolean;
  page?: number;
  limit?: number;
}
