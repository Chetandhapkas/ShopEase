import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Order } from '../types';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const OrdersHistoryPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await ordersAPI.getMyOrders();
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const handleCancelOrder = async () => {
    if (!cancelModalOrder) return;
    try {
      setCancellingId(cancelModalOrder.id);
      setCancelError(null);
      await ordersAPI.cancel(cancelModalOrder.id);
      setCancelModalOrder(null);
      await fetchOrders();
    } catch (err: any) {
      setCancelError(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-serif font-bold text-stone-900">Sign in to view orders</h2>
        <p className="text-xs text-stone-500">Please sign in to track and view your order history.</p>
        <Link to="/login" className="inline-block px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold">
          Sign In
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: Order['orderStatus']) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
            <CheckCircle className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
            <Truck className="w-3.5 h-3.5" /> In Transit / Shipped
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case 'PLACED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3.5 h-3.5" /> Order Placed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-3xl font-serif font-bold text-stone-900">My Order History</h1>
        <p className="text-xs text-stone-500 mt-1">Track status, receipts, and order management</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="bg-stone-100 animate-pulse rounded-2xl h-48"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto text-stone-400">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-900">No orders placed yet</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            When you complete an order on ShopEase, it will be securely recorded in MongoDB and tracked here in real time.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-stone-800 transition-colors"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow transition-shadow"
            >
              {/* Card Header */}
              <div className="p-4 sm:p-6 bg-stone-50/70 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-stone-900 text-sm">
                      {order.orderNumber}
                    </span>
                    {getStatusBadge(order.orderStatus)}
                  </div>
                  <p className="text-xs text-stone-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })} · Payment: <strong className="text-stone-700">{order.paymentMethod}</strong> ({order.paymentStatus})
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-stone-500">Total Amount</span>
                    <p className="text-base font-bold text-stone-900 tabular-nums">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                  </div>

                  {/* Cancel button if order is PLACED or CONFIRMED */}
                  {(order.orderStatus === 'PLACED' || order.orderStatus === 'CONFIRMED') && (
                    <button
                      onClick={() => setCancelModalOrder(order)}
                      className="px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* Card Items */}
              <div className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.items.map(item => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-3 p-2 rounded-xl bg-stone-50/50 border border-stone-100"
                    >
                      <img
                        src={item.productImage || '/src/assets/images/category_men_collection_1793874441796.jpg'}
                        alt={item.productName}
                        referrerPolicy="no-referrer"
                        className="w-14 h-16 object-cover rounded-lg bg-stone-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0 text-xs">
                        <Link
                          to={`/product/${item.productId}`}
                          className="font-semibold text-stone-900 hover:text-violet-600 truncate block"
                        >
                          {item.productName}
                        </Link>
                        <p className="text-stone-400 mt-0.5">
                          Qty: {item.quantity} {item.size ? `· Size ${item.size}` : ''}
                        </p>
                        <p className="font-bold text-stone-800 mt-1 tabular-nums">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Address & Breakdown */}
                <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row justify-between text-xs text-stone-500 gap-2">
                  <div>
                    <strong className="text-stone-700">Delivery Address: </strong>
                    <span>
                      {order.shippingAddress.fullName}, {order.shippingAddress.houseStreet}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pinCode}
                    </span>
                  </div>
                  {order.couponCode && (
                    <div className="text-emerald-700">
                      <span>Promo Applied: <strong>{order.couponCode}</strong> (-${order.couponDiscount.toFixed(2)})</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog for Order Cancellation */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-stone-900">
                Cancel Order {cancelModalOrder.orderNumber}?
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Cancelling this order will restore reserved product stock to MongoDB inventory. This action cannot be undone.
              </p>
            </div>

            {cancelError && (
              <p className="text-xs text-rose-600 font-medium">{cancelError}</p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCancelModalOrder(null)}
                className="flex-1 py-2 text-xs font-semibold border border-stone-200 rounded-xl text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancellingId === cancelModalOrder.id}
                className="flex-1 py-2 text-xs font-semibold bg-rose-600 text-white rounded-xl hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
              >
                {cancellingId === cancelModalOrder.id ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
