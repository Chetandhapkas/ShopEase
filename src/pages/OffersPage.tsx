import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Copy, Check, ArrowRight, Sparkles, Clock, Percent } from 'lucide-react';
import { Coupon } from '../types';
import { couponsAPI } from '../services/api';

export const OffersPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const res = await couponsAPI.getAll();
        setCoupons(res.data);
      } catch (err) {
        console.error('Failed to load coupons:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-stone-900 text-white p-8 sm:p-12 overflow-hidden border border-stone-800 shadow-md">
        <div className="relative z-10 max-w-xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-500/20 text-violet-300 text-xs font-semibold rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Seasonal Privilege Club
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white">
            Verified Coupons & VIP Offers
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            All coupons are calculated and validated in real time by the ShopEase backend engine. Copy any code and apply it directly at checkout or inside your shopping bag.
          </p>
        </div>
      </div>

      {/* Coupon Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-stone-100 animate-pulse rounded-2xl h-48"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {coupons.map(coupon => (
            <div
              key={coupon.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-serif font-bold text-stone-900">
                    {coupon.discountType === 'PERCENTAGE'
                      ? `${coupon.discountValue}% OFF`
                      : `$${coupon.discountValue} OFF`}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center">
                    <Percent className="w-4 h-4" />
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed font-medium">
                  {coupon.description}
                </p>

                <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 space-y-1">
                  <div>Min. Purchase: <strong>${coupon.minPurchase}</strong></div>
                  <div>Max. Discount: <strong>${coupon.maxDiscount}</strong></div>
                  <div className="flex items-center gap-1 text-stone-400">
                    <Clock className="w-3 h-3" />
                    <span>Valid until {coupon.expiryDate}</span>
                  </div>
                </div>
              </div>

              {/* Code Box */}
              <div className="pt-3">
                <div className="flex items-center justify-between p-2.5 bg-stone-50 border border-stone-200 border-dashed rounded-xl">
                  <span className="font-mono font-bold text-sm text-stone-900 tracking-wider">
                    {coupon.code}
                  </span>
                  <button
                    onClick={() => handleCopy(coupon.code)}
                    className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-700 transition-colors flex items-center gap-1 text-xs cursor-pointer"
                  >
                    {copiedCode === coupon.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 text-[10px] font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-500" />
                        <span className="text-stone-600 text-[10px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="text-center pt-8">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors shadow"
        >
          <span>Apply in Store · Shop Collection</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
