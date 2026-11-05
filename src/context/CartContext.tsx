import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartPopulatedItem } from '../types';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartPopulatedItem[];
  subtotal: number;
  totalItems: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (
    productId: string,
    quantity?: number,
    size?: string,
    color?: string
  ) => Promise<{ success: boolean; message?: string }>;
  updateQuantity: (
    productId: string,
    quantity: number,
    size?: string,
    color?: string
  ) => Promise<{ success: boolean; message?: string }>;
  removeItem: (
    productId: string,
    size?: string,
    color?: string
  ) => Promise<{ success: boolean; message?: string }>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartPopulatedItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setSubtotal(0);
      setTotalItems(0);
      return;
    }

    try {
      setIsLoading(true);
      const res = await cartAPI.get();
      setItems(res.data.items || []);
      setSubtotal(res.data.subtotal || 0);
      setTotalItems(res.data.totalItems || 0);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (
    productId: string,
    quantity = 1,
    size?: string,
    color?: string
  ) => {
    if (!isAuthenticated) {
      return { success: false, message: 'Please sign in to add items to your cart' };
    }

    try {
      await cartAPI.add({ productId, quantity, size, color });
      await refreshCart();
      return { success: true, message: 'Item added to your shopping bag' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to add item to cart'
      };
    }
  };

  const updateQuantity = async (
    productId: string,
    quantity: number,
    size?: string,
    color?: string
  ) => {
    try {
      await cartAPI.update({ productId, quantity, size, color });
      await refreshCart();
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update quantity'
      };
    }
  };

  const removeItem = async (productId: string, size?: string, color?: string) => {
    try {
      await cartAPI.remove(productId, size, color);
      await refreshCart();
      return { success: true, message: 'Item removed from bag' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to remove item'
      };
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear();
      setItems([]);
      setSubtotal(0);
      setTotalItems(0);
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        totalItems,
        isLoading,
        refreshCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
