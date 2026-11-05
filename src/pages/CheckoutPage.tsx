import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CreditCard,
  Banknote,
  QrCode,
  Building,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import { ShippingAddress } from '../types';

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, totalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Retrieve applied coupon from storage if any
  const [appliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(() => {
    const saved = localStorage.getItem('shopease_applied_coupon');
    return saved ? JSON.parse(saved) : null;
  });

  // Shipping Address Form State
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: user?.fullName || 'Sarah Jenkins',
    phone: user?.phone || '+1 (555) 482-9102',
    houseStreet: '742 Evergreen Terrace, Apt 4B',
    city: 'Portland',
    state: 'OR',
    pinCode: '97201'
  });

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI' | 'CARD' | 'NET_BANKING'>('COD');
  const [upiId, setUpiId] = useState('sarah.jenkins@okaxis');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');

  const [placingOrder, setPlacingOrder] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Calculations
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const deliveryCharge = subtotal > 150 ? 0 : 15;
  const taxableAmount = Math.max(0, subtotal - couponDiscount);
  const tax = Math.round(taxableAmount * 0.05 * 100) / 100;
  const totalPayable = Math.round((taxableAmount + deliveryCharge + tax) * 100) / 100;

  const handleAutofillDemoAddress = () => {
    setAddress({
      fullName: 'Sarah Jenkins',
      phone: '+1 (555) 482-9102',
      houseStreet: '742 Evergreen Terrace, Apt 4B',
      city: 'Portland',
      state: 'OR',
      pinCode: '97201'
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.fullName || !address.phone || !address.houseStreet || !address.city || !address.pinCode) {
      setErrorMsg('Please complete all delivery address fields');
      return;
    }

    try {
      setPlacingOrder(true);
      setErrorMsg(null);

      const res = await ordersAPI.checkout({
        shippingAddress: address,
        paymentMethod,
        couponCode: appliedCoupon?.code
      });

      // Clear stored coupon
      localStorage.removeItem('shopease_applied_coupon');

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore confetti errors
      }

      navigate(`/order-success/${res.data.order.id}`, { state: { order: res.data.order } });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to place order. Please review stock or cart.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-serif font-bold text-stone-900">Your bag is empty</h2>
        <p className="text-xs text-stone-500">Please add items to your cart before proceeding to checkout.</p>
        <Link to="/shop" className="inline-block px-5 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Checkout Title */}
      <div className="border-b border-stone-200 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">Secure Checkout</h1>
          <p className="text-xs text-stone-500 mt-1">Complete your shipping destination and payment details</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full font-medium">
          <Lock className="w-3.5 h-3.5" />
          <span>SSL 256-Bit Encrypted</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Step 1 Delivery + Step 3 Payment */}
        <div className="lg:col-span-7 space-y-8">
          {/* Step 1: Delivery Address */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-sm font-bold text-stone-900">Delivery Address</h2>
              </div>
              <button
                type="button"
                onClick={handleAutofillDemoAddress}
                className="text-xs text-violet-600 hover:text-violet-800 font-semibold cursor-pointer"
              >
                Autofill Demo Address
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={address.fullName}
                  onChange={e => setAddress({ ...address, fullName: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={address.phone}
                  onChange={e => setAddress({ ...address, phone: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-700 mb-1">House / Flat / Street Address</label>
                <input
                  type="text"
                  required
                  value={address.houseStreet}
                  onChange={e => setAddress({ ...address, houseStreet: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={e => setAddress({ ...address, city: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={address.state}
                    onChange={e => setAddress({ ...address, state: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">PIN / Postal</label>
                  <input
                    type="text"
                    required
                    value={address.pinCode}
                    onChange={e => setAddress({ ...address, pinCode: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method Selection */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="text-sm font-bold text-stone-900">Select Payment Method</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Cash on Delivery */}
              <label
                className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-violet-600 bg-violet-50/50 ring-1 ring-violet-500'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-0.5 text-violet-600"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-stone-900">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Cash on Delivery (COD)</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Pay with cash or card upon package arrival at your doorstep.
                  </p>
                </div>
              </label>

              {/* UPI Instant Simulation */}
              <label
                className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'UPI'
                    ? 'border-violet-600 bg-violet-50/50 ring-1 ring-violet-500'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="UPI"
                  checked={paymentMethod === 'UPI'}
                  onChange={() => setPaymentMethod('UPI')}
                  className="mt-0.5 text-violet-600"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-stone-900">
                    <QrCode className="w-4 h-4 text-violet-600" />
                    <span>Instant UPI / QR Code</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Google Pay, PhonePe, Paytm, BHIM instant simulated verification.
                  </p>
                </div>
              </label>

              {/* Credit / Debit Card */}
              <label
                className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'CARD'
                    ? 'border-violet-600 bg-violet-50/50 ring-1 ring-violet-500'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CARD"
                  checked={paymentMethod === 'CARD'}
                  onChange={() => setPaymentMethod('CARD')}
                  className="mt-0.5 text-violet-600"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-stone-900">
                    <CreditCard className="w-4 h-4 text-stone-700" />
                    <span>Credit / Debit Card</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Visa, Mastercard, Amex secured payment simulation.
                  </p>
                </div>
              </label>

              {/* Net Banking */}
              <label
                className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'NET_BANKING'
                    ? 'border-violet-600 bg-violet-50/50 ring-1 ring-violet-500'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="NET_BANKING"
                  checked={paymentMethod === 'NET_BANKING'}
                  onChange={() => setPaymentMethod('NET_BANKING')}
                  className="mt-0.5 text-violet-600"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-stone-900">
                    <Building className="w-4 h-4 text-stone-700" />
                    <span>Net Banking</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    All major national and international banking portals.
                  </p>
                </div>
              </label>
            </div>

            {/* UPI Details Box */}
            {paymentMethod === 'UPI' && (
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2 animate-in fade-in">
                <label className="block text-xs font-medium text-stone-700">Virtual Payment Address (VPA / UPI ID)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="username@bank"
                  className="w-full text-xs px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none"
                />
                <p className="text-[11px] text-stone-500">
                  Simulated verification: A payment authorization prompt will be simulated upon confirmation.
                </p>
              </div>
            )}

            {/* Card Details Box */}
            {paymentMethod === 'CARD' && (
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3 animate-in fade-in">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-stone-200 rounded-lg font-mono focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={e => setCardExpiry(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-stone-200 rounded-lg font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-stone-200 rounded-lg font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Review & Place Order */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5 shadow-sm">
            <h2 className="text-base font-bold text-stone-900 pb-3 border-b border-stone-100">
              Review Bag Items ({totalItems})
            </h2>

            {/* Compact items list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map(item => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex items-center gap-3 text-xs"
                >
                  <img
                    src={item.product?.images[0] || '/src/assets/images/category_men_collection_1793874441796.jpg'}
                    alt={item.product?.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-14 object-cover rounded-lg bg-stone-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-900 truncate">{item.product?.name}</p>
                    <p className="text-[11px] text-stone-400">
                      Qty: {item.quantity} {item.size ? `· Size ${item.size}` : ''}
                    </p>
                  </div>
                  <span className="font-bold text-stone-900 tabular-nums">
                    ${item.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-stone-100 pt-4 space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900 tabular-nums">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span className="font-semibold tabular-nums">
                    -${appliedCoupon.discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="tabular-nums">
                  {deliveryCharge === 0 ? <span className="text-emerald-700 font-semibold">FREE</span> : `$${deliveryCharge.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Sales Tax (5%)</span>
                <span className="tabular-nums">${tax.toFixed(2)}</span>
              </div>

              <div className="border-t border-stone-200 pt-3 flex justify-between text-lg font-bold text-stone-900">
                <span>Total Amount</span>
                <span className="text-violet-700 tabular-nums">${totalPayable.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={placingOrder}
              className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
            >
              {placingOrder ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing & Reserving Inventory...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Place Order · ${totalPayable.toFixed(2)}</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-stone-400 text-center leading-relaxed">
              By confirming, stock is atomically reserved and deducted from MongoDB inventory. An order confirmation will be immediately generated.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
