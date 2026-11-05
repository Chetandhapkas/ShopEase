import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  PackageX
} from 'lucide-react';
import { Product, Category } from '../types';
import { productsAPI, categoriesAPI } from '../services/api';
import { ProductCard } from '../components/product/ProductCard';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter States from URL or defaults
  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || 'all';
  const currentGender = searchParams.get('gender') || 'all';
  const currentBrand = searchParams.get('brand') || 'all';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentSize = searchParams.get('size') || '';
  const currentInStock = searchParams.get('inStock') === 'true';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentTrending = searchParams.get('trending') === 'true';
  const currentNewArrivals = searchParams.get('newArrivals') === 'true';

  // Available brands derived dynamically
  const availableBrands = useMemo(() => {
    return ['ShopEase Atelier', 'Nordic Weave', 'Lusso Veloce', 'Acoustic Labs', 'Aunora Botanicals', 'Chronos Precision'];
  }, []);

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '7 US', '8 US', '9 US', '10 US', '11 US'];

  // Update query params helper
  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all' || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(
    currentSearch ||
    currentCategory !== 'all' ||
    currentGender !== 'all' ||
    currentBrand !== 'all' ||
    currentMinPrice ||
    currentMaxPrice ||
    currentSize ||
    currentInStock ||
    currentTrending ||
    currentNewArrivals ||
    currentSort !== 'newest'
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesAPI.getAll();
        setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await productsAPI.getAll({
          search: currentSearch || undefined,
          category: currentCategory !== 'all' ? currentCategory : undefined,
          gender: currentGender !== 'all' ? currentGender : undefined,
          brand: currentBrand !== 'all' ? currentBrand : undefined,
          minPrice: currentMinPrice ? parseFloat(currentMinPrice) : undefined,
          maxPrice: currentMaxPrice ? parseFloat(currentMaxPrice) : undefined,
          size: currentSize || undefined,
          inStock: currentInStock ? true : undefined,
          sort: currentSort,
          trending: currentTrending ? true : undefined,
          newArrivals: currentNewArrivals ? true : undefined,
          limit: 50
        });

        setProducts(res.data.products);
        setTotalCount(res.data.total);
      } catch (err) {
        console.error('Error fetching filtered products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    currentSearch,
    currentCategory,
    currentGender,
    currentBrand,
    currentMinPrice,
    currentMaxPrice,
    currentSize,
    currentInStock,
    currentSort,
    currentTrending,
    currentNewArrivals
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">
            {currentCategory !== 'all'
              ? categories.find(c => c.id === currentCategory)?.name || 'Collection'
              : currentSearch
              ? `Results for "${currentSearch}"`
              : currentTrending
              ? 'Trending Selections'
              : currentNewArrivals
              ? 'New Arrivals'
              : 'All Designer Pieces'}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Displaying <span className="font-semibold text-stone-800 tabular-nums">{totalCount}</span> crafted pieces matching your criteria
          </p>
        </div>

        {/* Top Controls: Search Bar & Sort Dropdown */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={currentSearch}
              onChange={e => updateParam('search', e.target.value)}
              placeholder="Search catalogue..."
              className="w-full text-xs pl-8 pr-7 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-violet-500"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            {currentSearch && (
              <button
                onClick={() => updateParam('search', null)}
                className="absolute right-2 top-2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <select
            value={currentSort}
            onChange={e => updateParam('sort', e.target.value)}
            className="text-xs bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-700 focus:outline-none focus:border-violet-500 cursor-pointer"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="popularity">Most Popular</option>
          </select>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden p-2 text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50"
            aria-label="Open Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid + Filter Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <span className="text-xs uppercase tracking-wider font-semibold text-stone-900 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-violet-600 hover:text-violet-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Clear All
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-stone-800 uppercase tracking-wide">Category</h4>
            <div className="space-y-1">
              <button
                onClick={() => updateParam('category', null)}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                  currentCategory === 'all'
                    ? 'bg-stone-900 text-white font-medium'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <span>All Departments</span>
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => updateParam('category', c.id)}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                    currentCategory === c.id
                      ? 'bg-stone-900 text-white font-medium'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  {c.productCount !== undefined && (
                    <span className="text-[10px] opacity-60 tabular-nums">({c.productCount})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Gender Filter */}
          <div className="space-y-2 pt-4 border-t border-stone-100">
            <h4 className="text-xs font-semibold text-stone-800 uppercase tracking-wide">Gender / Style</h4>
            <div className="grid grid-cols-3 gap-1.5">
              {['all', 'Women', 'Men'].map(g => (
                <button
                  key={g}
                  onClick={() => updateParam('gender', g === 'all' ? null : g)}
                  className={`py-1.5 text-xs rounded-lg border text-center transition-colors cursor-pointer ${
                    (g === 'all' && currentGender === 'all') || currentGender === g
                      ? 'bg-stone-900 text-white border-stone-900 font-medium'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {g === 'all' ? 'All' : g}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2 pt-4 border-t border-stone-100">
            <h4 className="text-xs font-semibold text-stone-800 uppercase tracking-wide">Price Range ($)</h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={currentMinPrice}
                onChange={e => updateParam('minPrice', e.target.value)}
                className="w-1/2 text-xs px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
              />
              <span className="text-stone-400 text-xs">-</span>
              <input
                type="number"
                placeholder="Max"
                value={currentMaxPrice}
                onChange={e => updateParam('maxPrice', e.target.value)}
                className="w-1/2 text-xs px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
              />
            </div>
          </div>

          {/* Available Sizes */}
          <div className="space-y-2 pt-4 border-t border-stone-100">
            <h4 className="text-xs font-semibold text-stone-800 uppercase tracking-wide">Size</h4>
            <div className="flex flex-wrap gap-1.5">
              {availableSizes.map(size => (
                <button
                  key={size}
                  onClick={() => updateParam('size', currentSize === size ? null : size)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
                    currentSize === size
                      ? 'bg-stone-900 text-white border-stone-900 font-medium'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Brands Filter */}
          <div className="space-y-2 pt-4 border-t border-stone-100">
            <h4 className="text-xs font-semibold text-stone-800 uppercase tracking-wide">Brand Atelier</h4>
            <div className="space-y-1">
              <button
                onClick={() => updateParam('brand', null)}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  currentBrand === 'all'
                    ? 'bg-stone-100 text-stone-900 font-semibold'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                All Brands
              </button>
              {availableBrands.map(b => (
                <button
                  key={b}
                  onClick={() => updateParam('brand', currentBrand === b ? null : b)}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                    currentBrand === b
                      ? 'bg-stone-100 text-stone-900 font-semibold'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span>{b}</span>
                </button>
              ))}
            </div>
          </div>

          {/* In Stock Toggle */}
          <div className="pt-4 border-t border-stone-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700">
              <input
                type="checkbox"
                checked={currentInStock}
                onChange={e => updateParam('inStock', e.target.checked ? 'true' : null)}
                className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area (3 columns on desktop) */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="bg-stone-100 animate-pulse rounded-2xl h-96"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-md mx-auto space-y-4 my-8">
              <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto text-stone-400">
                <PackageX className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-serif font-bold text-stone-900">
                No matching pieces found
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                We couldn't find any products matching your specific combination of filters. Try clearing some filters or searching for something else.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Drawer Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-xs h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-sm font-semibold text-stone-900">Filters</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category selection */}
            <div>
              <h4 className="text-xs font-semibold text-stone-800 mb-2">Category</h4>
              <div className="space-y-1">
                <button
                  onClick={() => updateParam('category', null)}
                  className={`w-full text-left text-xs p-2 rounded ${
                    currentCategory === 'all' ? 'bg-stone-900 text-white' : 'text-stone-700'
                  }`}
                >
                  All
                </button>
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => updateParam('category', c.id)}
                    className={`w-full text-left text-xs p-2 rounded ${
                      currentCategory === c.id ? 'bg-stone-900 text-white' : 'text-stone-700'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* In Stock */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-stone-700">
                <input
                  type="checkbox"
                  checked={currentInStock}
                  onChange={e => updateParam('inStock', e.target.checked ? 'true' : null)}
                  className="rounded text-violet-600"
                />
                <span>In Stock Only</span>
              </label>
            </div>

            <div className="pt-4 border-t border-stone-200 flex gap-2">
              <button
                onClick={clearAllFilters}
                className="w-1/2 py-2 border border-stone-200 rounded-xl text-xs font-medium text-stone-700"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-1/2 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
