import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Tag,
  ArrowRight,
  ShieldCheck,
  Check,
  AlertCircle,
  X
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { couponsAPI } from '../services/api';
import { Coupon } from '../types';

export const CartPage: React.FC = () => {
  const { items, subtotal, totalItems, updateQuantity, removeItem, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    description: string;
  } | null>(() => {
    const saved = localStorage.getItem('shopease_applied_coupon');
    return saved ? JSON.parse(saved) : null;
  });
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // Fetch available coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await couponsAPI.getAll();
        setAvailableCoupons(res.data);
      } catch (err) {
        console.error('Error fetching coupons:', err);
      }
    };
    fetchCoupons();
  }, []);

  // Validate applied coupon whenever subtotal changes
  useEffect(() => {
    if (appliedCoupon && subtotal > 0) {
      couponsAPI
        .validate(appliedCoupon.code, subtotal)
        .then(res => {
          const updated = {
            code: res.data.code,
            discountAmount: res.data.discountAmount,
            description: res.data.description
          };
          setAppliedCoupon(updated);
          localStorage.setItem('shopease_applied_coupon', JSON.stringify(updated));
        })
        .catch(() => {
          // If subtotal dropped below min spend
          setAppliedCoupon(null);
          localStorage.removeItem('shopease_applied_coupon');
        });
    } else if (subtotal === 0) {
      setAppliedCoupon(null);
      localStorage.removeItem('shopease_applied_coupon');
    }
  }, [subtotal]);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponCodeInput).trim().toUpperCase();
    if (!code) return;

    try {
      setCouponLoading(true);
      setCouponError(null);
      setCouponSuccess(null);

      const res = await couponsAPI.validate(code, subtotal);
      const applied = {
        code: res.data.code,
        discountAmount: res.data.discountAmount,
        description: res.data.description
      };
      setAppliedCoupon(applied);
      localStorage.setItem('shopease_applied_coupon', JSON.stringify(applied));
      setCouponSuccess(`Coupon ${res.data.code} applied! Saved $${res.data.discountAmount.toFixed(2)}`);
      setCouponCodeInput('');
      setTimeout(() => setCouponSuccess(null), 3500);
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem('shopease_applied_coupon');
    setCouponSuccess(null);
    setCouponError(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-stone-100 rounded-3xl flex items-center justify-center mx-auto text-stone-500">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-900">Sign in to view your bag</h2>
        <p className="text-xs text-stone-500">
          Sign in to access your saved items, synchronize bag contents across devices, and apply VIP discounts.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-xl"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  if (items.length === 0 && !isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-stone-100 rounded-3xl flex items-center justify-center mx-auto text-stone-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-900">Your shopping bag is empty</h2>
        <p className="text-xs text-stone-500 leading-relaxed">
          Looks like you haven't added any luxury pieces to your bag yet. Explore our curated collections for inspired apparel and footwear.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-stone-800 transition-colors shadow"
        >
          <span>Explore Collections</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Calculations
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const deliveryCharge = subtotal > 150 || subtotal === 0 ? 0 : 15;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const estimatedTax = Math.round(taxableSubtotal * 0.05 * 100) / 100;
  const grandTotal = Math.round((taxableSubtotal + deliveryCharge + estimatedTax) * 100) / 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-3xl font-serif font-bold text-stone-900">Shopping Bag</h1>
        <p className="text-xs text-stone-500 mt-1">
          Review your selected pieces ({totalItems} {totalItems === 1 ? 'item' : 'items'})
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items List (Left Column) */}
        <div className="lg:col-span-8 space-y-4">
          {items.map(item => (
            <div
              key={`${item.productId}-${item.size}-${item.color}`}
              className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 flex gap-4 sm:gap-6 items-center hover:shadow-sm transition-shadow"
            >
              {/* Product Thumbnail */}
              <Link
                to={`/product/${item.productId}`}
                className="w-20 h-24 sm:w-24 sm:h-30 bg-stone-100 rounded-xl overflow-hidden shrink-0 border border-stone-100"
              >
                <img
                  src={item.product?.images[0] || '/src/assets/images/category_men_collection_1793874441796.jpg'}
                  alt={item.product?.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </Link>

              {/* Item Info */}
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider">
                  {item.product?.brand}
                </span>
                <Link
                  to={`/product/${item.productId}`}
                  className="text-sm font-semibold text-stone-900 hover:text-violet-600 transition-colors block truncate"
                >
                  {item.product?.name}
                </Link>

                {/* Variant options */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-1">
                  {item.size && (
                    <span>
                      Size: <strong className="text-stone-800">{item.size}</strong>
                    </span>
                  )}
                  {item.color && (
                    <span>
                      Color: <strong className="text-stone-800">{item.color}</strong>
                    </span>
                  )}
                </div>

                {/* Unit Price */}
                <div className="text-xs text-stone-500 mt-1">
                  ${item.product?.price.toFixed(2)} each
                </div>

                {/* Mobile Stepper & Remove */}
                <div className="flex sm:hidden items-center justify-between pt-3 mt-2 border-t border-stone-100">
                  <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1, item.size, item.color)
                      }
                      className="px-2 py-1 text-stone-600 hover:text-stone-900"
                    >
                      -
                    </button>
                    <span className="px-2 text-xs font-semibold tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1, item.size, item.color)
                      }
                      className="px-2 py-1 text-stone-600 hover:text-stone-900"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-bold text-stone-900 text-sm tabular-nums">
                    ${item.subtotal.toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeItem(item.productId, item.size, item.color)}
                    className="text-stone-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Desktop Stepper */}
              <div className="hidden sm:flex items-center border border-stone-200 rounded-xl bg-white p-1">
                <button
                  onClick={() =>
                    updateQuantity(item.productId, item.quantity - 1, item.size, item.color)
                  }
                  className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  -
                </button>
                <span className="w-8 text-center font-semibold text-xs text-stone-800 tabular-nums">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(item.productId, item.quantity + 1, item.size, item.color)
                  }
                  disabled={item.quantity >= (item.product?.stockQuantity || 10)}
                  className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Desktop Line Total */}
              <div className="hidden sm:block text-right min-w-24">
                <span className="text-base font-bold text-stone-900 tabular-nums">
                  ${item.subtotal.toFixed(2)}
                </span>
              </div>

              {/* Desktop Remove Button */}
              <button
                onClick={() => removeItem(item.productId, item.size, item.color)}
                className="hidden sm:block text-stone-400 hover:text-rose-600 p-2 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Quick link to continue browsing */}
          <div className="pt-2">
            <Link
              to="/shop"
              className="text-xs text-stone-600 hover:text-stone-900 underline font-medium"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Box (Right Column) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6 shadow-sm">
            <h2 className="text-base font-bold text-stone-900">Order Summary</h2>

            {/* Coupon Application Box */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-violet-600" />
                Apply Coupon Code
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-violet-50 border border-violet-200 rounded-xl">
                  <div>
                    <span className="text-xs font-mono font-bold text-violet-900">
                      {appliedCoupon.code}
                    </span>
                    <p className="text-[11px] text-violet-700 mt-0.5">
                      {appliedCoupon.description} (-${appliedCoupon.discountAmount.toFixed(2)})
                    </p>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="p-1 text-violet-400 hover:text-violet-800 transition-colors cursor-pointer"
                    title="Remove coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={e => setCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder="Enter coupon (e.g. WELCOME10)"
                    className="flex-1 text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-violet-500 uppercase font-mono"
                  />
                  <button
                    onClick={() => handleApplyCoupon()}
                    disabled={couponLoading || !couponCodeInput.trim()}
                    className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    {couponLoading ? 'Checking...' : 'Apply'}
                  </button>
                </div>
              )}

              {couponError && (
                <p className="text-[11px] text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {couponError}
                </p>
              )}
              {couponSuccess && (
                <p className="text-[11px] text-emerald-600 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  {couponSuccess}
                </p>
              )}

              {/* Quick Coupon Codes Chips */}
              {!appliedCoupon && availableCoupons.length > 0 && (
                <div className="pt-2">
                  <p className="text-[11px] text-stone-400 mb-1.5 font-medium">Available Offers:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {availableCoupons.slice(0, 3).map(c => (
                      <button
                        key={c.code}
                        onClick={() => handleApplyCoupon(c.code)}
                        className="text-[11px] font-mono font-medium px-2 py-1 rounded bg-stone-100 text-stone-700 hover:bg-violet-100 hover:text-violet-800 transition-colors cursor-pointer"
                      >
                        {c.code} ({c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `$${c.discountValue}`})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-stone-100 pt-4 space-y-2.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900 tabular-nums">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span className="font-semibold tabular-nums">
                    -${appliedCoupon.discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="tabular-nums">
                  {deliveryCharge === 0 ? (
                    <span className="text-emerald-700 font-semibold">FREE</span>
                  ) : (
                    `$${deliveryCharge.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Sales Tax (5%)</span>
                <span className="tabular-nums">${estimatedTax.toFixed(2)}</span>
              </div>

              <div className="border-t border-stone-200 pt-3 flex justify-between text-base font-bold text-stone-900">
                <span>Payable Total</span>
                <span className="tabular-nums text-violet-700">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-violet-600/20 transition-all cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Encrypted 256-bit Checkout Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
