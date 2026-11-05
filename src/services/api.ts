import axios from 'axios';
import {
  User,
  Product,
  Category,
  CartResponse,
  Coupon,
  Order,
  ShippingAddress,
  DashboardStats,
  FilterParams
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token from localStorage to every request
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('shopease_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Catch 401 Unauthorized responses to clear expired credentials
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const isAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthRoute) {
        localStorage.removeItem('shopease_token');
        localStorage.removeItem('shopease_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword?: string;
    adminSecretKey?: string;
  }) => api.post<{ message: string; token: string; user: User }>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<{ message: string; token: string; user: User }>('/auth/login', data),

  logout: () => api.post('/auth/logout'),

  getMe: () => api.get<{ user: User }>('/auth/me')
};

export const productsAPI = {
  getAll: (params?: FilterParams) =>
    api.get<{ products: Product[]; total: number; page: number; totalPages: number }>('/products', {
      params
    }),

  getById: (id: string) => api.get<Product>(`/products/${id}`),

  create: (data: Partial<Product>) => api.post<Product>('/products', data),

  update: (id: string, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data),

  delete: (id: string) => api.delete<{ message: string }>(`/products/${id}`)
};

export const categoriesAPI = {
  getAll: () => api.get<Category[]>('/categories'),
  create: (data: Partial<Category>) => api.post<Category>('/categories', data),
  update: (id: string, data: Partial<Category>) => api.put<Category>(`/categories/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/categories/${id}`)
};

export const cartAPI = {
  get: () => api.get<CartResponse>('/cart'),

  add: (data: { productId: string; size?: string; color?: string; quantity?: number }) =>
    api.post<{ message: string; cart: any }>('/cart/add', data),

  update: (data: { productId: string; quantity: number; size?: string; color?: string }) =>
    api.put<{ message: string; cart: any }>('/cart/update', data),

  remove: (productId: string, size?: string, color?: string) =>
    api.delete<{ message: string; cart: any }>(`/cart/remove/${productId}`, {
      params: { size, color }
    }),

  clear: () => api.delete<{ message: string }>('/cart/clear')
};

export const wishlistAPI = {
  get: () => api.get<{ userId: string; products: Product[]; totalCount: number }>('/wishlist'),

  toggle: (productId: string) =>
    api.post<{ message: string; added: boolean; wishlist: any }>('/wishlist/toggle', { productId }),

  remove: (productId: string) =>
    api.delete<{ message: string; wishlist: any }>(`/wishlist/remove/${productId}`)
};

export const couponsAPI = {
  getAll: () => api.get<Coupon[]>('/coupons'),

  validate: (code: string, cartSubtotal: number) =>
    api.post<{
      valid: boolean;
      code: string;
      description: string;
      discountAmount: number;
      coupon: Coupon;
    }>('/coupons/validate', { code, cartSubtotal }),

  create: (data: Partial<Coupon>) => api.post<Coupon>('/coupons', data),

  update: (id: string, data: Partial<Coupon>) => api.put<Coupon>(`/coupons/${id}`, data),

  delete: (id: string) => api.delete<{ message: string }>(`/coupons/${id}`)
};

export const ordersAPI = {
  checkout: (data: {
    shippingAddress: ShippingAddress;
    paymentMethod: 'COD' | 'UPI' | 'CARD' | 'NET_BANKING';
    couponCode?: string;
  }) => api.post<{ message: string; order: Order }>('/orders/checkout', data),

  getMyOrders: () => api.get<Order[]>('/orders/my-orders'),

  getById: (id: string) => api.get<Order>(`/orders/${id}`),

  cancel: (id: string) => api.put<{ message: string; order: Order }>(`/orders/${id}/cancel`)
};

export const adminAPI = {
  getDashboard: () => api.get<DashboardStats>('/admin/dashboard'),

  getUsers: () => api.get<(User & { ordersCount: number })[]>('/admin/users'),

  toggleUserStatus: (id: string) =>
    api.put<{ message: string; user: User }>(`/admin/users/${id}/toggle-status`),

  getOrders: (status?: string) => api.get<Order[]>('/admin/orders', { params: { status } }),

  updateOrderStatus: (id: string, status: Order['orderStatus']) =>
    api.put<{ message: string; order: Order }>(`/admin/orders/${id}/status`, { status })
};

export default api;
