import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Tag, ShieldCheck, Truck, RefreshCw, CreditCard, Copy, Check } from 'lucide-react';
import { Product, Category, Coupon } from '../types';
import { productsAPI, categoriesAPI, couponsAPI } from '../services/api';
import { ProductCard } from '../components/product/ProductCard';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [catRes, trendRes, newRes, coupRes] = await Promise.all([
          categoriesAPI.getAll(),
          productsAPI.getAll({ trending: true, limit: 4 }),
          productsAPI.getAll({ newArrivals: true, limit: 4 }),
          couponsAPI.getAll()
        ]);

        setCategories(catRes.data);
        setTrendingProducts(trendRes.data.products);
        setNewArrivals(newRes.data.products);
        setCoupons(coupRes.data);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-stone-900 text-white min-h-[560px] lg:min-h-[640px] flex items-center">
        {/* Background Photography with measured scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_fashion_banner_1793874440664.jpg"
            alt="ShopEase Haute Couture Editorial"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center brightness-75 lg:brightness-85 scale-102 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/60 to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/20 border border-violet-400/30 text-violet-200 rounded-full text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-violet-300" />
              <span>Autumn / Winter Luxury Collection 2026</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-tight">
              Discover Your Style, <br />
              <span className="italic font-normal text-violet-300">Shop Smarter.</span>
            </h1>

            <p className="text-base sm:text-lg text-stone-300 leading-relaxed max-w-lg">
              Explore timeless silhouettes, bespoke Italian tailoring, and curated lifestyle essentials crafted for contemporary elegance and effortless everyday luxury.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/shop"
                className="px-8 py-3.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-600/30 transition-all flex items-center gap-2 group"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/shop?trending=true"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-semibold rounded-xl backdrop-blur-sm transition-all"
              >
                Explore Collections
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Shop By Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold tracking-wider text-violet-600 uppercase">
              Curated Departments
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.id}`}
              className="group relative bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col"
            >
              <div className="aspect-square bg-stone-100 overflow-hidden relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/10 transition-colors"></div>
              </div>
              <div className="p-3 text-center">
                <h3 className="text-xs sm:text-sm font-semibold text-stone-900 group-hover:text-violet-600 transition-colors truncate">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {cat.productCount ? `${cat.productCount} Pieces` : 'Explore'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold tracking-wider text-violet-600 uppercase">
              Popular Selections
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
              Trending Products
            </h2>
          </div>
          <Link
            to="/shop?trending=true"
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 group"
          >
            <span>See All Trending</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-stone-100 animate-pulse rounded-2xl h-80"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Special Offers Banner & Coupon Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-stone-950 text-white overflow-hidden border border-stone-800 shadow-xl">
          <div className="absolute inset-0 z-0">
            <img
              src="/src/assets/images/special_offer_banner_1793874442423.jpg"
              alt="Special Offers & Seasonal Coupons"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-stone-950/50"></div>
          </div>

          <div className="relative z-10 p-8 sm:p-12 lg:p-16">
            <div className="max-w-2xl space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-600 text-xs font-bold uppercase tracking-wider text-white">
                <Tag className="w-3.5 h-3.5" />
                Special Promotional Offers
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
                Elevate Your Wardrobe with Exclusive Seasonal Discounts
              </h2>
              <p className="text-sm text-stone-300 leading-relaxed">
                Apply verified promo codes at checkout for immediate price reductions. Valid across all designer apparel, footwear, and accessories.
              </p>

              {/* Coupon Codes Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                {coupons.slice(0, 4).map(c => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-violet-300">
                          {c.code}
                        </span>
                        <span className="text-[10px] bg-stone-800 text-stone-200 px-1.5 py-0.5 rounded">
                          {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `$${c.discountValue} OFF`}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">{c.description}</p>
                    </div>
                    <button
                      onClick={() => handleCopyCode(c.code)}
                      className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
                      title="Copy promo code"
                    >
                      {copiedCode === c.code ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-stone-300" />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-stone-900 hover:bg-stone-100 rounded-xl font-semibold text-xs transition-colors shadow"
                >
                  <span>Explore All Offers</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold tracking-wider text-violet-600 uppercase">
              Fresh Drops
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/shop?newArrivals=true"
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 group"
          >
            <span>View All New</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-stone-100 animate-pulse rounded-2xl h-80"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Why Choose ShopEase? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-semibold tracking-wider text-violet-600 uppercase">
            The ShopEase Standard
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
            Why Discerning Shoppers Choose Us
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-2">
            Engineered with modern full-stack reliability, ethical materials, and seamless shopping guarantees.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-stone-900">Secure Checkout & Auth</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              BCrypt hashed credentials, signed tokens, role authorization, and encrypted transaction protection.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-stone-900">Hassle-Free Returns</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Complimentary 30-day doorstep return pickup and instant exchange processing on all unworn items.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-stone-900">COD & Flexible Payments</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Order with Cash on Delivery, instant UPI payment confirmation, credit/debit card, or net banking.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-stone-900">Live Inventory & Tracking</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Atomic inventory decrementing and end-to-end milestone tracking from order confirmation to doorstep delivery.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
