import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Search,
  ShieldCheck,
  LogOut,
  Package,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout, quickLoginAs } = useAuth();
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchModal(false);
      setSearchQuery('');
    }
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Top micro-announcement banner */}
      <div className="bg-stone-900 text-stone-200 text-xs py-1.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden sm:block text-stone-400">
            College Full-Stack Showcase · Spring Boot REST API & MongoDB Atlas
          </div>
          <div className="mx-auto sm:mx-0 flex items-center gap-2 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Complimentary worldwide delivery on orders over $150 · Use code WELCOME10</span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-stone-400">
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span>Demo switch:</span>
                <button
                  onClick={() => quickLoginAs('USER')}
                  className="text-stone-200 hover:text-white underline cursor-pointer"
                >
                  Customer
                </button>
                <span>·</span>
                <button
                  onClick={() => quickLoginAs('ADMIN')}
                  className="text-violet-300 hover:text-violet-200 underline cursor-pointer"
                >
                  Admin
                </button>
              </div>
            ) : (
              <span>Role: <strong className="text-white">{user?.role}</strong></span>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar: Strict 3-zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-18">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-600 hover:text-stone-900"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link to="/" className="text-2xl font-bold tracking-tight text-stone-900 flex items-center group">
              Shop<span className="text-violet-600">Ease</span>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-600 ml-1 mb-1 transition-transform group-hover:scale-125"></span>
            </Link>
          </div>

          {/* Zone 2: 4-5 single-line clean navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <Link
              to="/"
              className={`transition-colors whitespace-nowrap hover:text-stone-900 ${
                isActive('/') ? 'text-violet-600 font-semibold' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className={`transition-colors whitespace-nowrap hover:text-stone-900 ${
                isActive('/shop') ? 'text-violet-600 font-semibold' : ''
              }`}
            >
              Collection
            </Link>
            <Link
              to="/shop?category=cat_women"
              className="transition-colors whitespace-nowrap hover:text-stone-900"
            >
              Women
            </Link>
            <Link
              to="/shop?category=cat_men"
              className="transition-colors whitespace-nowrap hover:text-stone-900"
            >
              Men
            </Link>
            <Link
              to="/offers"
              className={`transition-colors whitespace-nowrap hover:text-stone-900 flex items-center gap-1.5 ${
                isActive('/offers') ? 'text-violet-600 font-semibold' : ''
              }`}
            >
              <span>Offers</span>
              <span className="text-[10px] tracking-wide uppercase px-1.5 py-0.2 bg-violet-50 text-violet-700 font-semibold rounded">
                Save 50%
              </span>
            </Link>
          </nav>

          {/* Zone 3: Primary Action & Utilities */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Quick search affordance */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors flex items-center gap-2 text-xs"
              title="Search catalogue"
            >
              <Search className="w-5 h-5 text-stone-700" />
              <span className="hidden xl:inline text-stone-400">Search products...</span>
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
              title="View Wishlist"
            >
              <Heart className="w-5 h-5 text-stone-700" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-stone-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors flex items-center"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5 text-stone-700" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Account / Profile dropdown */}
            <div className="relative">
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2 py-1 px-2.5 rounded-lg border border-stone-200 hover:border-stone-300 bg-white transition-colors text-xs font-medium text-stone-800"
                  >
                    <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden sm:inline max-w-28 truncate">{user?.fullName}</span>
                  </button>

                  {showUserDropdown && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <div className="px-4 py-2 border-b border-stone-100">
                        <p className="text-xs font-semibold text-stone-900 truncate">{user?.fullName}</p>
                        <p className="text-xs text-stone-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded">
                          {user?.role} Account
                        </span>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-violet-700 hover:bg-violet-50 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Admin Console
                        </Link>
                      )}

                      <Link
                        to="/orders"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
                      >
                        <Package className="w-4 h-4 text-stone-500" />
                        My Orders
                      </Link>

                      <Link
                        to="/wishlist"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
                      >
                        <Heart className="w-4 h-4 text-stone-500" />
                        Saved Wishlist
                      </Link>

                      <div className="border-t border-stone-100 my-1"></div>

                      <button
                        onClick={logout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="hidden sm:inline-block px-3.5 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors whitespace-nowrap shadow-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search designer catalog..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          </form>

          <nav className="flex flex-col space-y-2 text-sm font-medium text-stone-700">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-violet-600"
            >
              Home
            </Link>
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-violet-600"
            >
              Full Collection
            </Link>
            <Link
              to="/shop?category=cat_women"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-violet-600"
            >
              Women's Apparel
            </Link>
            <Link
              to="/shop?category=cat_men"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-violet-600"
            >
              Men's Apparel
            </Link>
            <Link
              to="/shop?category=cat_footwear"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-violet-600"
            >
              Footwear & Leather
            </Link>
            <Link
              to="/offers"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-violet-600 flex items-center justify-between"
            >
              <span>Promotional Offers</span>
              <span className="text-[10px] bg-violet-100 text-violet-800 font-semibold px-2 py-0.5 rounded">
                Active Codes
              </span>
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 text-violet-700 font-semibold flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-xl w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="text-xs uppercase font-semibold tracking-wider text-stone-400">
                Quick Product Search
              </span>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm"
              >
                Esc / Close
              </button>
            </div>
            <form onSubmit={handleSearchSubmit} className="mt-4">
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Type product name, brand, material, or style..."
                  className="w-full text-base pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
                <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-3.5" />
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-stone-500">
                <span>Popular searches: Trench Coat, Cashmere, Sneakers, Leather Bag</span>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 font-medium cursor-pointer"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
