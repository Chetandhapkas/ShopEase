import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const WishlistPage: React.FC = () => {
  const { items, removeFromWishlist, count, isLoading } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleMoveToCart = async (productId: string, size?: string, color?: string) => {
    await addToCart(productId, 1, size, color);
    await removeFromWishlist(productId);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-900">Sign in to view your wishlist</h2>
        <p className="text-xs text-stone-500">
          Save garments and accessories you love, track restocks, and order whenever you are ready.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-xl cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-3xl font-serif font-bold text-stone-900">Saved Wishlist</h1>
        <p className="text-xs text-stone-500 mt-1">
          {count} {count === 1 ? 'curated piece' : 'curated pieces'} saved for later
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-stone-100 animate-pulse rounded-2xl h-80"></div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-md mx-auto space-y-4 my-8">
          <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto text-stone-400">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-900">Your wishlist is empty</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Discover tailored blazers, handcrafted footwear, and silk slip dresses in our latest collections.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-stone-800 transition-colors shadow"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col group hover:shadow-md transition-all"
            >
              <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden">
                <Link to={`/product/${product.id}`} className="block w-full h-full">
                  <img
                    src={product.images[0] || '/src/assets/images/category_men_collection_1793874441796.jpg'}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-stone-400 hover:text-rose-600 transition-colors shadow-sm cursor-pointer"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider">
                    {product.brand}
                  </span>
                  <Link
                    to={`/product/${product.id}`}
                    className="text-sm font-semibold text-stone-900 hover:text-violet-600 truncate block mt-0.5"
                  >
                    {product.name}
                  </Link>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-sm font-bold text-stone-900 tabular-nums">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-xs text-stone-400 line-through tabular-nums">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-stone-100">
                  <button
                    onClick={() =>
                      handleMoveToCart(
                        product.id,
                        product.sizes?.[0] || 'M',
                        product.colors?.[0] || 'Default'
                      )
                    }
                    disabled={product.stockQuantity <= 0}
                    className="w-full py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{product.stockQuantity <= 0 ? 'Out of Stock' : 'Move to Bag'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
