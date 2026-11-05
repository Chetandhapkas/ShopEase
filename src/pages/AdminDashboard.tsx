import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Tag,
  ShoppingBag,
  Users,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminAPI, productsAPI, categoriesAPI, couponsAPI } from '../services/api';
import { Product, Category, Coupon, Order, User, DashboardStats } from '../types';

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'categories' | 'coupons' | 'orders' | 'users' | 'inventory'
  >('overview');

  // Stats & Entities
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [usersList, setUsersList] = useState<(User & { ordersCount: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderFilterStatus, setOrderFilterStatus] = useState('ALL');

  // Modal States
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    brand: '',
    category: '',
    gender: 'Unisex',
    price: '',
    originalPrice: '',
    stockQuantity: '10',
    sizes: 'S, M, L, XL',
    colors: 'Black, Sandstone, Lilac',
    images: '/src/assets/images/category_men_collection_1793874441796.jpg'
  });

  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '15',
    minPurchase: '50',
    maxDiscount: '30',
    expiryDate: '2027-12-31',
    description: ''
  });

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: '/src/assets/images/category_women_collection_1793874442289.jpg'
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'product' | 'coupon' | 'category'; id: string; name: string } | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const notify = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, prodRes, catRes, coupRes, ordRes, usrRes] = await Promise.all([
        adminAPI.getDashboard(),
        productsAPI.getAll({ limit: 100 }),
        categoriesAPI.getAll(),
        couponsAPI.getAll(),
        adminAPI.getOrders(),
        adminAPI.getUsers()
      ]);

      setStats(statsRes.data);
      setProducts(prodRes.data.products);
      setCategories(catRes.data);
      setCoupons(coupRes.data);
      setOrders(ordRes.data);
      setUsersList(usrRes.data);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadData();
    }
  }, [isAuthenticated, isAdmin]);

  // Security check: If not admin, block rendering
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-900">403 · Access Denied</h2>
        <p className="text-xs text-stone-500 leading-relaxed">
          The Admin Console is strictly restricted to accounts with administrative credentials. Your current role is <strong>{user?.role || 'GUEST'}</strong>.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold"
        >
          Return to Customer Store
        </Link>
      </div>
    );
  }

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['orderStatus']) => {
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      notify(`Order ${orderId} status updated to ${newStatus}`);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order');
    }
  };

  // Handle User Toggle
  const handleToggleUser = async (userId: string) => {
    try {
      const res = await adminAPI.toggleUserStatus(userId);
      notify(res.data.message);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  // Handle Product Save (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<Product> = {
        name: productForm.name,
        description: productForm.description,
        brand: productForm.brand || 'ShopEase Atelier',
        category: productForm.category || categories[0]?.id || 'cat_women',
        gender: productForm.gender as any,
        price: parseFloat(productForm.price),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : parseFloat(productForm.price),
        stockQuantity: parseInt(productForm.stockQuantity),
        sizes: productForm.sizes.split(',').map(s => s.trim()).filter(Boolean),
        colors: productForm.colors.split(',').map(c => c.trim()).filter(Boolean),
        images: productForm.images.split(',').map(i => i.trim()).filter(Boolean)
      };

      if (editingProduct) {
        await productsAPI.update(editingProduct.id, payload);
        notify(`Product "${productForm.name}" updated successfully`);
      } else {
        await productsAPI.create(payload);
        notify(`Product "${productForm.name}" created and added to database`);
      }

      setProductModalOpen(false);
      setEditingProduct(null);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving product');
    }
  };

  // Open Edit Product Modal
  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      description: prod.description,
      brand: prod.brand,
      category: prod.category,
      gender: prod.gender,
      price: prod.price.toString(),
      originalPrice: prod.originalPrice.toString(),
      stockQuantity: prod.stockQuantity.toString(),
      sizes: prod.sizes.join(', '),
      colors: prod.colors.join(', '),
      images: prod.images.join(', ')
    });
    setProductModalOpen(true);
  };

  // Open Create Product Modal
  const openCreateProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      brand: 'ShopEase Atelier',
      category: categories[0]?.id || 'cat_women',
      gender: 'Unisex',
      price: '',
      originalPrice: '',
      stockQuantity: '15',
      sizes: 'S, M, L, XL',
      colors: 'Charcoal, Ivory, Sandstone',
      images: '/src/assets/images/category_women_collection_1793874442289.jpg'
    });
    setProductModalOpen(true);
  };

  // Handle Coupon Create
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await couponsAPI.create({
        code: couponForm.code.toUpperCase().trim(),
        discountType: couponForm.discountType as any,
        discountValue: parseFloat(couponForm.discountValue),
        minPurchase: parseFloat(couponForm.minPurchase),
        maxDiscount: parseFloat(couponForm.maxDiscount),
        expiryDate: couponForm.expiryDate,
        description: couponForm.description,
        active: true
      });
      notify(`Coupon ${couponForm.code} created`);
      setCouponModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create coupon');
    }
  };

  // Handle Category Create
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await categoriesAPI.create({
        name: categoryForm.name,
        slug: categoryForm.slug || categoryForm.name.toLowerCase().replace(/\s+/g, '-'),
        description: categoryForm.description,
        image: categoryForm.image
      });
      notify(`Category "${categoryForm.name}" created`);
      setCategoryModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create category');
    }
  };

  // Confirm and Execute Delete
  const executeDelete = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === 'product') {
        await productsAPI.delete(deleteConfirm.id);
        notify(`Product removed from catalog`);
      } else if (deleteConfirm.type === 'coupon') {
        await couponsAPI.delete(deleteConfirm.id);
        notify(`Coupon deleted`);
      } else if (deleteConfirm.type === 'category') {
        await categoriesAPI.delete(deleteConfirm.id);
        notify(`Category deleted`);
      }
      setDeleteConfirm(null);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  // Filtered orders list
  const filteredOrders = orders.filter(o =>
    orderFilterStatus === 'ALL' ? true : o.orderStatus === orderFilterStatus
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
              Administrator Console
            </span>
            <span className="text-xs text-stone-400">· MongoDB Live Storefront</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mt-1">
            ShopEase Command Center
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 border border-stone-200 rounded-xl hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateProduct}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'products', label: 'Manage Products', count: products.length, icon: Package },
          { id: 'orders', label: 'Manage Orders', count: orders.length, icon: ShoppingBag },
          { id: 'inventory', label: 'Inventory Alerts', count: stats?.lowStockProductsCount, icon: AlertTriangle },
          { id: 'categories', label: 'Categories', count: categories.length, icon: Layers },
          { id: 'coupons', label: 'Coupons & Promos', count: coupons.length, icon: Tag },
          { id: 'users', label: 'Registered Users', count: usersList.length, icon: Users }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    isActive ? 'bg-stone-800 text-stone-200' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* 6 KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-1">
              <span className="text-[11px] font-semibold text-stone-400 uppercase">Total Revenue</span>
              <p className="text-xl font-bold text-stone-900 tabular-nums">
                ${stats?.totalRevenue.toFixed(2) || '0.00'}
              </p>
              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Real transactions
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-1">
              <span className="text-[11px] font-semibold text-stone-400 uppercase">Total Orders</span>
              <p className="text-xl font-bold text-stone-900 tabular-nums">
                {stats?.totalOrders || 0}
              </p>
              <span className="text-[10px] text-stone-400">Stored in MongoDB</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-1">
              <span className="text-[11px] font-semibold text-stone-400 uppercase">Pending Orders</span>
              <p className="text-xl font-bold text-amber-700 tabular-nums">
                {stats?.pendingOrdersCount || 0}
              </p>
              <span className="text-[10px] text-stone-400">Awaiting dispatch</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-1">
              <span className="text-[11px] font-semibold text-stone-400 uppercase">Active Catalog</span>
              <p className="text-xl font-bold text-stone-900 tabular-nums">
                {stats?.totalProducts || 0}
              </p>
              <span className="text-[10px] text-stone-400">Across {categories.length} departments</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-1">
              <span className="text-[11px] font-semibold text-stone-400 uppercase">Low Stock Alerts</span>
              <p className="text-xl font-bold text-rose-600 tabular-nums">
                {stats?.lowStockProductsCount || 0}
              </p>
              <span className="text-[10px] text-rose-600 font-medium">Under 10 units</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-1">
              <span className="text-[11px] font-semibold text-stone-400 uppercase">Registered Users</span>
              <p className="text-xl font-bold text-stone-900 tabular-nums">
                {stats?.totalUsers || 0}
              </p>
              <span className="text-[10px] text-stone-400">BCrypt secured</span>
            </div>
          </div>

          {/* Recent Orders Preview */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900">Recent Customer Orders</h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs text-violet-600 hover:text-violet-800 font-semibold"
              >
                View All Orders →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3">Order Number</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Items</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Payment</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.slice(0, 5).map(o => (
                    <tr key={o.id} className="hover:bg-stone-50/50">
                      <td className="py-3 px-3 font-mono font-bold text-stone-900">{o.orderNumber}</td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-stone-800">{o.userName}</p>
                        <p className="text-[11px] text-stone-400">{o.userEmail}</p>
                      </td>
                      <td className="py-3 px-3">{o.items.length} items</td>
                      <td className="py-3 px-3 font-bold tabular-nums">${o.totalAmount.toFixed(2)}</td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] font-semibold text-stone-700">{o.paymentMethod}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-50 text-violet-700">
                          {o.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={o.orderStatus}
                          onChange={e => handleUpdateOrderStatus(o.id, e.target.value as any)}
                          className="text-[11px] bg-stone-50 border border-stone-200 rounded px-2 py-1"
                        >
                          <option value="PLACED">PLACED</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Manage Products */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900">
              Product Catalog Management ({products.length} Products)
            </h3>
            <button
              onClick={openCreateProduct}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Stock Quantity</th>
                  <th className="py-2.5 px-3">Sizes</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-stone-50/50">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0] || '/src/assets/images/category_men_collection_1793874441796.jpg'}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-12 object-cover rounded-lg bg-stone-100"
                        />
                        <div>
                          <p className="font-semibold text-stone-900 line-clamp-1">{p.name}</p>
                          <p className="text-[11px] text-stone-400">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-stone-600">
                      {categories.find(c => c.id === p.category)?.name || p.category}
                    </td>
                    <td className="py-3 px-3 font-bold tabular-nums">
                      ${p.price.toFixed(2)}
                      {p.discount > 0 && (
                        <span className="text-[10px] text-violet-600 ml-1">(-{p.discount}%)</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-semibold tabular-nums ${
                          p.stockQuantity < 10 ? 'text-rose-600' : 'text-stone-800'
                        }`}
                      >
                        {p.stockQuantity} units
                      </span>
                    </td>
                    <td className="py-3 px-3 text-stone-500">{p.sizes.join(', ')}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          p.active ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {p.active ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditProduct(p)}
                          className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'product', id: p.id, name: p.name })}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Manage Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-bold text-stone-900">
              Orders Management ({filteredOrders.length} Orders)
            </h3>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500">Filter status:</span>
              <select
                value={orderFilterStatus}
                onChange={e => setOrderFilterStatus(e.target.value)}
                className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-700"
              >
                <option value="ALL">All Statuses</option>
                <option value="PLACED">PLACED</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Order #</th>
                  <th className="py-2.5 px-3">Customer & Phone</th>
                  <th className="py-2.5 px-3">Delivery City</th>
                  <th className="py-2.5 px-3">Total Amount</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map(o => (
                  <tr key={o.id} className="hover:bg-stone-50/50">
                    <td className="py-3 px-3 font-mono font-bold text-stone-900">{o.orderNumber}</td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-stone-800">{o.userName}</p>
                      <p className="text-[11px] text-stone-400">{o.shippingAddress.phone}</p>
                    </td>
                    <td className="py-3 px-3 text-stone-600">
                      {o.shippingAddress.city}, {o.shippingAddress.state}
                    </td>
                    <td className="py-3 px-3 font-bold tabular-nums">${o.totalAmount.toFixed(2)}</td>
                    <td className="py-3 px-3">
                      <span className="text-[11px] font-semibold text-stone-800">{o.paymentMethod}</span>
                      <p className="text-[10px] text-stone-400">{o.paymentStatus}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-50 text-violet-700">
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={o.orderStatus}
                        onChange={e => handleUpdateOrderStatus(o.id, e.target.value as any)}
                        className="text-xs bg-white border border-stone-200 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                      >
                        <option value="PLACED">PLACED</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED (Restore Stock)</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Inventory Alerts */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Low Stock Inventory Monitor (Units &lt; 10)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Brand</th>
                  <th className="py-2.5 px-3">Remaining Stock</th>
                  <th className="py-2.5 px-3">Quick Restock (+25 Units)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products
                  .filter(p => p.stockQuantity < 10)
                  .map(p => (
                    <tr key={p.id} className="hover:bg-stone-50/50">
                      <td className="py-3 px-3 font-semibold text-stone-900">{p.name}</td>
                      <td className="py-3 px-3 text-stone-500">{p.brand}</td>
                      <td className="py-3 px-3 font-bold text-rose-600 tabular-nums">
                        {p.stockQuantity} remaining
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={async () => {
                            await productsAPI.update(p.id, { stockQuantity: p.stockQuantity + 25 });
                            notify(`Restocked 25 units for "${p.name}"`);
                            await loadData();
                          }}
                          className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          + Restock 25 Units
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Categories */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900">Departments & Categories</h3>
            <button
              onClick={() => setCategoryModalOpen(true)}
              className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(c => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-stone-200 flex items-center gap-3 bg-stone-50/50"
              >
                <img
                  src={c.image}
                  alt={c.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 object-cover rounded-lg bg-stone-200"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs text-stone-900">{c.name}</h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">{c.productCount || 0} active pieces</p>
                </div>
                <button
                  onClick={() => setDeleteConfirm({ type: 'category', id: c.id, name: c.name })}
                  className="text-stone-400 hover:text-rose-600 p-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Coupons */}
      {activeTab === 'coupons' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900">Promotions & Coupons Engine</h3>
            <button
              onClick={() => setCouponModalOpen(true)}
              className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Coupon</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Discount</th>
                  <th className="py-2.5 px-3">Min Purchase</th>
                  <th className="py-2.5 px-3">Max Discount</th>
                  <th className="py-2.5 px-3">Expiry</th>
                  <th className="py-2.5 px-3">Usage Count</th>
                  <th className="py-2.5 px-3 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {coupons.map(c => (
                  <tr key={c.id} className="hover:bg-stone-50/50">
                    <td className="py-3 px-3 font-mono font-bold text-stone-900">{c.code}</td>
                    <td className="py-3 px-3 font-semibold text-violet-700">
                      {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `$${c.discountValue} OFF`}
                    </td>
                    <td className="py-3 px-3 tabular-nums">${c.minPurchase}</td>
                    <td className="py-3 px-3 tabular-nums">${c.maxDiscount}</td>
                    <td className="py-3 px-3 text-stone-500">{c.expiryDate}</td>
                    <td className="py-3 px-3 tabular-nums">{c.usageCount || 0} times</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setDeleteConfirm({ type: 'coupon', id: c.id, name: c.code })}
                        className="text-stone-400 hover:text-rose-600 p-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 7: Users */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h3 className="text-base font-bold text-stone-900">
            Registered Customer & Administrator Accounts ({usersList.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Full Name</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Orders Placed</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {usersList.map(u => (
                  <tr key={u.id} className="hover:bg-stone-50/50">
                    <td className="py-3 px-3 font-semibold text-stone-900">{u.fullName}</td>
                    <td className="py-3 px-3 text-stone-600">{u.email}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          u.role === 'ADMIN' ? 'bg-violet-100 text-violet-800' : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold tabular-nums">{u.ordersCount || 0}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          u.active !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {u.active !== false ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {u.id !== user?.id && (
                        <button
                          onClick={() => handleToggleUser(u.id)}
                          className="px-2.5 py-1 text-xs font-semibold rounded border border-stone-200 hover:bg-stone-50 cursor-pointer"
                        >
                          {u.active !== false ? 'Suspend User' : 'Activate User'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">
                {editingProduct ? 'Edit Catalog Product' : 'Add New Designer Product'}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-stone-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Brand Atelier</label>
                  <input
                    type="text"
                    value={productForm.brand}
                    onChange={e => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Department / Category</label>
                  <select
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Gender</label>
                  <select
                    value={productForm.gender}
                    onChange={e => setProductForm({ ...productForm, gender: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Women">Women</option>
                    <option value="Men">Men</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Original Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.originalPrice}
                    onChange={e => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={productForm.stockQuantity}
                    onChange={e => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-stone-700 mb-1">Available Sizes (comma separated)</label>
                  <input
                    type="text"
                    value={productForm.sizes}
                    onChange={e => setProductForm({ ...productForm, sizes: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-stone-700 mb-1">Available Colors (comma separated)</label>
                  <input
                    type="text"
                    value={productForm.colors}
                    onChange={e => setProductForm({ ...productForm, colors: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-stone-700 mb-1">Image URLs (comma separated)</label>
                  <input
                    type="text"
                    value={productForm.images}
                    onChange={e => setProductForm({ ...productForm, images: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-[11px]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-stone-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={productForm.description}
                    onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold border border-stone-200 rounded-xl text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-semibold bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  {editingProduct ? 'Save Updates' : 'Publish Product to Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Coupon Modal */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">Create New Coupon</h3>
              <button onClick={() => setCouponModalOpen(false)} className="text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE25"
                  value={couponForm.code}
                  onChange={e => setCouponForm({ ...couponForm, code: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={e => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={couponForm.discountValue}
                    onChange={e => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Min. Order ($)</label>
                  <input
                    type="number"
                    value={couponForm.minPurchase}
                    onChange={e => setCouponForm({ ...couponForm, minPurchase: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Max. Discount ($)</label>
                  <input
                    type="number"
                    value={couponForm.maxDiscount}
                    onChange={e => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. 25% OFF on orders over $100"
                  value={couponForm.description}
                  onChange={e => setCouponForm({ ...couponForm, description: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold border border-stone-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold bg-stone-900 text-white rounded-xl hover:bg-stone-800"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">Add Department Category</h3>
              <button onClick={() => setCategoryModalOpen(false)} className="text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fine Jewelry & Watches"
                  value={categoryForm.name}
                  onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Description</label>
                <input
                  type="text"
                  value={categoryForm.description}
                  onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={categoryForm.image}
                  onChange={e => setCategoryForm({ ...categoryForm, image: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold border border-stone-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold bg-stone-900 text-white rounded-xl hover:bg-stone-800"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 border border-stone-200 shadow-xl">
            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">
                Delete {deleteConfirm.type}: {deleteConfirm.name}?
              </h4>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                This item will be permanently removed from MongoDB storage.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 text-xs font-semibold border border-stone-200 rounded-xl text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 py-2 text-xs font-semibold bg-rose-600 text-white rounded-xl hover:bg-rose-700 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
