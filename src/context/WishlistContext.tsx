import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { wishlistAPI } from '../services/api';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  items: Product[];
  count: number;
  isLoading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<{ success: boolean; added: boolean; message?: string }>;
  removeFromWishlist: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    try {
      setIsLoading(true);
      const res = await wishlistAPI.get();
      setItems(res.data.products || []);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const isInWishlist = (productId: string) => {
    return items.some(p => p.id === productId);
  };

  const toggleWishlist = async (productId: string) => {
    if (!isAuthenticated) {
      return { success: false, added: false, message: 'Please sign in to save items to your wishlist' };
    }

    try {
      const res = await wishlistAPI.toggle(productId);
      await refreshWishlist();
      return {
        success: true,
        added: res.data.added,
        message: res.data.added ? 'Added to wishlist' : 'Removed from wishlist'
      };
    } catch (err: any) {
      return {
        success: false,
        added: false,
        message: err.response?.data?.message || 'Failed to update wishlist'
      };
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      await wishlistAPI.remove(productId);
      setItems(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        count: items.length,
        isLoading,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        refreshWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
