import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Check } from 'lucide-react';
import { Product } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || 'Default');
  const [addingToCart, setAddingToCart] = useState(false);
  const [showQuickSelect, setShowQuickSelect] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stockQuantity <= 0;

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await toggleWishlist(product.id);
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isOutOfStock) return;

    if (product.sizes.length > 1 && !showQuickSelect) {
      setShowQuickSelect(true);
      return;
    }

    setAddingToCart(true);
    const res = await addToCart(product.id, 1, selectedSize, selectedColor);
    setAddingToCart(false);

    if (res.success) {
      setAddedSuccess(true);
      setShowQuickSelect(false);
      setTimeout(() => setAddedSuccess(false), 2000);
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Image container */}
      <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.images[0] || '/src/assets/images/category_men_collection_1793874441796.jpg'}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Top Badges: Zero pill spam, subtle text tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
          {product.discount > 0 && (
            <span className="text-[11px] font-bold bg-violet-600 text-white px-2 py-0.5 rounded shadow-sm">
              -{product.discount}%
            </span>
          )}
          {product.isNewArrival && (
            <span className="text-[11px] font-semibold bg-stone-900 text-white px-2 py-0.5 rounded shadow-sm">
              New Arrival
            </span>
          )}
          {isOutOfStock && (
            <span className="text-[11px] font-semibold bg-rose-600 text-white px-2 py-0.5 rounded shadow-sm">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            isFavorited
              ? 'bg-rose-50 text-rose-600 shadow-md'
              : 'bg-white/80 text-stone-700 hover:bg-white hover:text-stone-900 shadow-sm'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current text-rose-600' : ''}`} />
        </button>

        {/* Quick Add Overlay on desktop hover */}
        <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
          {!showQuickSelect ? (
            <button
              onClick={handleQuickAdd}
              disabled={isOutOfStock || addingToCart}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                addedSuccess
                  ? 'bg-emerald-600 text-white'
                  : isOutOfStock
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  : 'bg-stone-900 hover:bg-stone-800 text-white'
              }`}
            >
              {addedSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Added to Bag
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  {isOutOfStock ? 'Sold Out' : product.sizes.length > 1 ? 'Quick Select Size' : 'Quick Add to Bag'}
                </>
              )}
            </button>
          ) : (
            <div className="bg-white p-2.5 rounded-xl shadow-xl border border-stone-200 space-y-2 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-stone-700">Select Size:</span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setShowQuickSelect(false);
                  }}
                  className="text-stone-400 hover:text-stone-600 text-[10px]"
                >
                  Cancel
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedSize(size);
                    }}
                    className={`px-2 py-1 text-xs font-medium rounded border transition-colors ${
                      selectedSize === size
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <button
                onClick={handleQuickAdd}
                disabled={addingToCart}
                className="w-full py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold"
              >
                {addingToCart ? 'Adding...' : `Confirm Size (${selectedSize})`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Rating clean metadata */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="uppercase tracking-wider font-semibold text-[11px] text-stone-400">
              {product.brand}
            </span>
            <div className="flex items-center gap-1 text-stone-700 font-medium">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-stone-400">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <Link
            to={`/product/${product.id}`}
            className="text-sm font-semibold text-stone-900 hover:text-violet-600 transition-colors line-clamp-1 block mb-2"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Sizes preview if applicable */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="text-[11px] text-stone-400 mb-2 truncate">
              Sizes: {product.sizes.join(', ')}
            </div>
          )}
        </div>

        {/* Price & Mobile Add */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-stone-900 tabular-nums">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-stone-400 line-through tabular-nums">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Mobile direct Add button */}
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className="sm:hidden p-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800 disabled:bg-stone-300"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
