import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, RotateCcw, Award, CreditCard, Truck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      {/* 5 Value Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-stone-800">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <ShieldCheck className="w-6 h-6 text-violet-400" />
            <h4 className="text-sm font-semibold text-white">Secure Shopping</h4>
            <p className="text-xs text-stone-400">256-bit SSL encrypted checkout and protected transactions.</p>
          </div>
          <div className="flex flex-col items-center md:items-start space-y-2">
            <RotateCcw className="w-6 h-6 text-violet-400" />
            <h4 className="text-sm font-semibold text-white">Easy 30-Day Returns</h4>
            <p className="text-xs text-stone-400">Hassle-free complimentary pickup and instant exchange.</p>
          </div>
          <div className="flex flex-col items-center md:items-start space-y-2">
            <Award className="w-6 h-6 text-violet-400" />
            <h4 className="text-sm font-semibold text-white">Quality Guarantee</h4>
            <p className="text-xs text-stone-400">Certified authentic materials and master artisan craftsmanship.</p>
          </div>
          <div className="flex flex-col items-center md:items-start space-y-2">
            <CreditCard className="w-6 h-6 text-violet-400" />
            <h4 className="text-sm font-semibold text-white">Multiple Payment Modes</h4>
            <p className="text-xs text-stone-400">Cash on Delivery, UPI, cards, and net banking accepted.</p>
          </div>
          <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-start space-y-2">
            <Truck className="w-6 h-6 text-violet-400" />
            <h4 className="text-sm font-semibold text-white">Fast & Tracked Shipping</h4>
            <p className="text-xs text-stone-400">Real-time order progress updates from warehouse to doorstep.</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="text-2xl font-bold tracking-tight text-white flex items-center">
              Shop<span className="text-violet-400">Ease</span>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 ml-1 mb-1"></span>
            </Link>
            <p className="text-xs text-stone-400 leading-relaxed">
              Curated contemporary fashion, artisanal footwear, and elevated lifestyle essentials. Designed with minimalist elegance, built with full-stack Spring Boot REST APIs and MongoDB Atlas integration.
            </p>
            <div className="text-xs text-stone-400">
              <span className="font-semibold text-stone-300">Technical Demo Account:</span>
              <p className="mt-1">Admin: <span className="font-mono text-stone-300">admin@shopease.com</span> (Admin@123)</p>
              <p>User: <span className="font-mono text-stone-300">user@shopease.com</span> (User@123)</p>
            </div>
          </div>

          <div>
            <h5 className="text-xs uppercase tracking-wider font-semibold text-white mb-4">Shop Collections</h5>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li><Link to="/shop?category=cat_women" className="hover:text-white transition-colors">Women's Atelier</Link></li>
              <li><Link to="/shop?category=cat_men" className="hover:text-white transition-colors">Men's Tailoring</Link></li>
              <li><Link to="/shop?category=cat_footwear" className="hover:text-white transition-colors">Footwear & Sneakers</Link></li>
              <li><Link to="/shop?category=cat_accessories" className="hover:text-white transition-colors">Leather Goods & Bags</Link></li>
              <li><Link to="/shop?category=cat_lifestyle" className="hover:text-white transition-colors">Fragrance & Lifestyle</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs uppercase tracking-wider font-semibold text-white mb-4">Customer Care</h5>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li><Link to="/orders" className="hover:text-white transition-colors">Track Order Status</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Bag & Checkout</Link></li>
              <li><Link to="/offers" className="hover:text-white transition-colors">Promo Coupons & Vouchers</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Saved Wishlist</Link></li>
              <li><a href="#support" className="hover:text-white transition-colors">Shipping & Returns Policy</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs uppercase tracking-wider font-semibold text-white mb-4">Architecture & College Project</h5>
            <p className="text-xs text-stone-400 mb-3">
              This system demonstrates full-stack Java Spring Boot architecture, Spring Data MongoDB Atlas schemas, BCrypt authentication, role-based authorization, and transactional inventory decrementing.
            </p>
            <div className="p-3 rounded-lg bg-stone-800 border border-stone-700/60 text-[11px] text-stone-300 space-y-1">
              <div><strong className="text-white">API Version:</strong> REST v1.0</div>
              <div><strong className="text-white">Database:</strong> MongoDB Atlas</div>
              <div><strong className="text-white">Auth:</strong> BCrypt + Bearer Token</div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-stone-800 text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          © {new Date().getFullYear()} ShopEase Platform. All rights reserved. Built for College Full-Stack Development Evaluation.
        </div>
        <div className="flex items-center gap-6">
          <a href="#terms" className="hover:text-stone-300 transition-colors">Privacy Policy</a>
          <a href="#terms" className="hover:text-stone-300 transition-colors">Terms of Service</a>
          <a href="#terms" className="hover:text-stone-300 transition-colors">Security Audit</a>
        </div>
      </div>
    </footer>
  );
};
