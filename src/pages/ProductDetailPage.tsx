import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { Product } from '../types';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addFeedback, setAddFeedback] = useState<string | null>(null);
  const [pinCode, setPinCode] = useState('');
  const [pinStatus, setPinStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await productsAPI.getById(id);
        setProduct(res.data);
        if (res.data.sizes?.length > 0) setSelectedSize(res.data.sizes[0]);
        if (res.data.colors?.length > 0) setSelectedColor(res.data.colors[0]);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-pulse space-y-4 text-center">
          <div className="w-12 h-12 rounded-full border-4 border-violet-600 border-t-transparent animate-spin mx-auto"></div>
          <p className="text-xs text-stone-500">Loading piece specifications...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-serif font-bold text-stone-900">Product Not Found</h2>
        <p className="text-xs text-stone-500">
          The requested garment or accessory could not be found or may have been archived.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Collection
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stockQuantity <= 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isOutOfStock) return;

    setAddingToCart(true);
    setAddFeedback(null);
    const res = await addToCart(product.id, quantity, selectedSize, selectedColor);
    setAddingToCart(false);

    if (res.success) {
      setAddFeedback('Successfully added to your shopping bag');
      setTimeout(() => setAddFeedback(null), 3000);
    } else {
      setAddFeedback(res.message || 'Failed to add item');
    }
  };

  const handleCheckPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode.trim().length >= 4) {
      setPinStatus('Delivery available! Estimated arrival within 2-4 business days.');
    } else {
      setPinStatus('Please enter a valid PIN or postal code.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back link */}
      <div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Collection
        </Link>
      </div>

      {/* Main PDP Grid: Gallery Left, Contiguous Purchase Module Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-[4/5] bg-stone-100 rounded-3xl overflow-hidden border border-stone-200">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-md shadow-sm">
                -{product.discount}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails row */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-24 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    selectedImageIndex === idx ? 'border-violet-600 shadow-md' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} perspective ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2 border-b border-stone-200 pb-6">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="uppercase tracking-wider font-semibold text-violet-700">
                {product.brand}
              </span>
              <div className="flex items-center gap-1 font-medium text-stone-700">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-stone-400">· {product.reviewsCount} verified reviews</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 leading-snug">
              {product.name}
            </h1>

            {/* Price section */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-bold text-stone-900 tabular-nums">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-base text-stone-400 line-through tabular-nums">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
              {product.discount > 0 && (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Save ${(product.originalPrice - product.price).toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock indicator */}
            <div className="pt-2 text-xs">
              {product.stockQuantity > 10 ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> In Stock & Ready to Ship ({product.stockQuantity} available)
                </span>
              ) : product.stockQuantity > 0 ? (
                <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> Only {product.stockQuantity} units left in stock
                </span>
              ) : (
                <span className="text-rose-600 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> Currently Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {product.description}
          </div>

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-stone-800">Color Palette</span>
                <span className="text-stone-500">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 text-xs rounded-xl border transition-all cursor-pointer ${
                      selectedColor === color
                        ? 'border-stone-900 bg-stone-900 text-white font-medium shadow-sm'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-stone-800">Select Size</span>
                <span className="text-stone-500">{selectedSize}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-11 px-3 py-2 text-xs rounded-xl border transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'border-stone-900 bg-stone-900 text-white font-semibold shadow-sm'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Quantity Stepper */}
              <div className="flex items-center border border-stone-200 rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                >
                  -
                </button>
                <span className="w-10 text-center font-semibold text-xs text-stone-800 tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  disabled={quantity >= product.stockQuantity || isOutOfStock}
                  className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Add to Bag Button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
                className={`flex-1 py-3 px-6 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                  isOutOfStock
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                    : 'bg-violet-600 hover:bg-violet-700 text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                {addingToCart
                  ? 'Adding to Bag...'
                  : isOutOfStock
                  ? 'Sold Out'
                  : `Add to Bag · $${(product.price * quantity).toFixed(2)}`}
              </button>

              {/* Wishlist Button */}
              <button
                onClick={async () => {
                  if (!isAuthenticated) {
                    navigate('/login');
                    return;
                  }
                  await toggleWishlist(product.id);
                }}
                className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                  isFavorited
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current text-rose-600' : ''}`} />
              </button>
            </div>

            {/* Live Feedback banner */}
            {addFeedback && (
              <div className="p-3 bg-stone-900 text-white text-xs rounded-xl flex items-center justify-between animate-in fade-in">
                <span>{addFeedback}</span>
                <Link to="/cart" className="text-violet-300 underline font-semibold">
                  View Bag
                </Link>
              </div>
            )}
          </div>

          {/* Delivery & Pincode Checker */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-semibold text-stone-800">
              <Truck className="w-4 h-4 text-violet-600" />
              <span>Check Delivery Availability</span>
            </div>
            <form onSubmit={handleCheckPin} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter postal or PIN code"
                value={pinCode}
                onChange={e => setPinCode(e.target.value)}
                className="flex-1 bg-white border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-stone-400 text-xs"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Verify
              </button>
            </form>
            {pinStatus && (
              <p className="text-[11px] text-stone-600 font-medium">{pinStatus}</p>
            )}
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-2 gap-3 text-[11px] text-stone-500 pt-2">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-stone-400" />
              <span>30-Day Doorstep Returns</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-stone-400" />
              <span>100% Genuine Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
