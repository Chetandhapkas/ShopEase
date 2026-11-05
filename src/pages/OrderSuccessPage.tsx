import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Truck, MapPin } from 'lucide-react';
import { Order } from '../types';
import { ordersAPI } from '../services/api';

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>((location.state as any)?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order && id) {
      ordersAPI
        .getById(id)
        .then(res => setOrder(res.data))
        .catch(err => console.error('Error loading order:', err))
        .finally(() => setLoading(false));
    }
  }, [id, order]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-stone-500">Retrieving order confirmation...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-stone-900">Order Confirmed</h2>
        <p className="text-xs text-stone-500">
          Your order has been saved in MongoDB. Check your orders page to review status.
        </p>
        <Link
          to="/orders"
          className="inline-block px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold"
        >
          View My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-10 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Order Confirmed & Placed
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
            Thank you for shopping with ShopEase!
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-md mx-auto">
            Your order <strong className="font-mono text-stone-800">{order.orderNumber}</strong> has been received and verified by our fulfillment system.
          </p>
        </div>

        {/* Milestone Steps Bar */}
        <div className="pt-6 pb-2 max-w-lg mx-auto">
          <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-medium text-stone-600">
            <div className="space-y-1">
              <div className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center mx-auto text-xs font-bold">
                ✓
              </div>
              <span className="text-violet-700 font-bold">Placed</span>
            </div>
            <div className="space-y-1 opacity-70">
              <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center mx-auto text-xs">
                2
              </div>
              <span>Confirmed</span>
            </div>
            <div className="space-y-1 opacity-70">
              <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center mx-auto text-xs">
                3
              </div>
              <span>Shipped</span>
            </div>
            <div className="space-y-1 opacity-70">
              <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center mx-auto text-xs">
                4
              </div>
              <span>Delivered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Box */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6">
        <h2 className="text-base font-bold text-stone-900 pb-3 border-b border-stone-100 flex items-center gap-2">
          <Package className="w-4 h-4 text-violet-600" />
          <span>Receipt Summary</span>
        </h2>

        {/* Items */}
        <div className="space-y-3">
          {order.items.map(item => (
            <div
              key={item.productId}
              className="flex items-center justify-between text-xs py-2 border-b border-stone-50"
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.productImage || '/src/assets/images/category_men_collection_1793874441796.jpg'}
                  alt={item.productName}
                  referrerPolicy="no-referrer"
                  className="w-12 h-14 object-cover rounded-lg bg-stone-100"
                />
                <div>
                  <p className="font-semibold text-stone-900">{item.productName}</p>
                  <p className="text-[11px] text-stone-400">
                    Qty: {item.quantity} {item.size ? `· Size ${item.size}` : ''}
                  </p>
                </div>
              </div>
              <span className="font-bold text-stone-900 tabular-nums">
                ${item.subtotal.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Address and Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 space-y-1">
            <span className="font-semibold text-stone-800 flex items-center gap-1.5 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-500" />
              Delivery Destination
            </span>
            <p className="font-medium text-stone-900">{order.shippingAddress.fullName}</p>
            <p className="text-stone-500">{order.shippingAddress.houseStreet}</p>
            <p className="text-stone-500">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pinCode}
            </p>
            <p className="text-stone-500">{order.shippingAddress.phone}</p>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 space-y-1.5">
            <span className="font-semibold text-stone-800 flex items-center gap-1.5 mb-1.5">
              <Truck className="w-3.5 h-3.5 text-stone-500" />
              Payment & Logistics
            </span>
            <div className="flex justify-between">
              <span className="text-stone-500">Payment Mode:</span>
              <span className="font-semibold text-stone-900">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Payment Status:</span>
              <span className="font-semibold text-emerald-700">{order.paymentStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Order Status:</span>
              <span className="font-semibold text-violet-700">{order.orderStatus}</span>
            </div>
          </div>
        </div>

        {/* Financials */}
        <div className="border-t border-stone-100 pt-4 space-y-2 text-xs text-stone-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="tabular-nums font-medium text-stone-900">${order.subtotal.toFixed(2)}</span>
          </div>
          {order.couponDiscount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Coupon Discount ({order.couponCode})</span>
              <span className="tabular-nums font-semibold">-${order.couponDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery</span>
            <span className="tabular-nums font-medium text-stone-900">
              {order.deliveryCharge === 0 ? 'FREE' : `$${order.deliveryCharge.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Sales Tax</span>
            <span className="tabular-nums font-medium text-stone-900">${order.tax.toFixed(2)}</span>
          </div>
          <div className="border-t border-stone-200 pt-2 flex justify-between text-base font-bold text-stone-900">
            <span>Total Paid / Payable</span>
            <span className="text-violet-700 tabular-nums">${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Navigation CTAs */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <Link
            to="/orders"
            className="flex-1 py-3 px-4 bg-stone-900 text-white rounded-xl text-xs font-semibold text-center hover:bg-stone-800 transition-colors shadow"
          >
            Track in Order History
          </Link>
          <Link
            to="/shop"
            className="flex-1 py-3 px-4 bg-white border border-stone-200 text-stone-800 rounded-xl text-xs font-semibold text-center hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
