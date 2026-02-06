"use client";

import { useState, useEffect, useContext, createContext, ReactNode, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./use-auth";

export interface TestCartItem {
  id: string;
  title: string;
  price: number;
  type: 'individual' | 'series';
  seriesId?: string;
  image?: string;
  addedAt?: string;
}

interface TestCartContextType {
  testCart: TestCartItem[];
  addToTestCart: (item: TestCartItem) => Promise<void>;
  removeFromTestCart: (itemId: string) => Promise<void>;
  clearTestCart: () => Promise<void>;
  loading: boolean;
}

const TestCartContext = createContext<TestCartContextType | undefined>(undefined);

// Guest cart functions (localStorage)
function getGuestTestCart(): TestCartItem[] {
  try {
    const cart = localStorage.getItem('testCart');
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
}

function saveGuestTestCart(cart: TestCartItem[]) {
  try {
    localStorage.setItem('testCart', JSON.stringify(cart));
  } catch (error) {
    console.error("Failed to save guest test cart to localStorage", error);
  }
}

export function TestCartProvider({ children }: { children: ReactNode }) {
  const [testCart, setTestCart] = useState<TestCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, userData } = useAuth();

  // Load test cart on mount and when user changes
  useEffect(() => {
    loadTestCart();
  }, [user?.id]);

  const loadTestCart = useCallback(async () => {
    setLoading(true);

    if (user?.id) {
      // Load from database for authenticated users
      try {
        const { data: cartData, error } = await supabase
          .from('test_carts')
          .select('id, test_id, test_title, test_price, test_type, series_id, test_image, added_at')
          .eq('user_id', user.id);

        if (error) {
          console.warn("Test cart database unavailable, using local storage:", error.message);
          setTestCart(getGuestTestCart());
        } else {
          const cartItems = cartData?.map(item => ({
            id: item.test_id,
            title: item.test_title,
            price: item.test_price,
            type: item.test_type as 'individual' | 'series',
            seriesId: item.series_id,
            image: item.test_image,
            addedAt: item.added_at
          })) || [];
          setTestCart(cartItems);
        }
      } catch (err) {
        console.warn("Test cart functionality disabled - using local storage:", err);
        setTestCart(getGuestTestCart());
      }
    } else {
      // Load from local storage for guests
      setTestCart(getGuestTestCart());
    }

    setLoading(false);
  }, [user?.id]);

  const addToTestCart = useCallback(async (item: TestCartItem) => {
    if (user?.id) {
      // Add to database for authenticated users
      try {
        const { error } = await supabase
          .from('test_carts')
          .insert({
            user_id: user.id,
            test_id: item.id,
            test_title: item.title,
            test_price: item.price,
            test_type: item.type,
            series_id: item.seriesId || null,
            test_image: item.image || null,
          });

        if (error) {
          console.error("❌ Supabase error details:", {
            message: error.message,
            code: error.code,
            hint: error.hint,
            details: error.details,
            fullError: error
          });
          
          // If table doesn't exist, RLS error, UNIQUE constraint, or other config issue, handle gracefully
          if (
            error.code === '42P01' || // undefined table
            error.code === '42000' || // permission denied
            error.code === '23505' || // unique constraint violation
            error.code === '42883' || // function not found
            error.message?.includes('test_carts') || // table name in error
            error.message?.includes('permission') || // permission in error
            error.message?.includes('unique') // unique constraint
          ) {
            // Log what happened
            if (error.code === '23505' || error.message?.includes('unique')) {
              console.warn("⚠️ Item already in cart, reloading from database");
              // Reload cart from database to show the existing item
              await loadTestCart();
              return;
            } else {
              console.warn("⚠️ test_carts table not ready or RLS issue, using localStorage fallback");
              // For other config issues, fall back to localStorage
              const updatedCart = [...testCart, item];
              saveGuestTestCart(updatedCart);
              setTestCart(updatedCart);
              return;
            }
          }
          throw error;
        }

        console.log("✅ Item added to test cart successfully");
        // Reload from database to ensure consistency
        await loadTestCart();
      } catch (err) {
        console.error("❌ Failed to add to test cart, falling back to localStorage:", {
          message: err instanceof Error ? err.message : String(err),
          fullError: err
        });
        // Fallback to local storage on any error
        const updatedCart = [...testCart, item];
        saveGuestTestCart(updatedCart);
        setTestCart(updatedCart);
      }
    } else {
      // Add to local storage for guests
      const updatedCart = [...testCart, item];
      saveGuestTestCart(updatedCart);
      setTestCart(updatedCart);
    }
  }, [testCart, user?.id, loadTestCart]);

  const removeFromTestCart = useCallback(async (itemId: string) => {
    if (user?.id) {
      // Remove from database for authenticated users
      try {
        const { error } = await supabase
          .from('test_carts')
          .delete()
          .eq('user_id', user.id)
          .eq('test_id', itemId);

        if (error) {
          console.error("❌ Error removing from test cart:", {
            message: error.message,
            code: error.code,
            fullError: error
          });
          throw error;
        }

        console.log("✅ Item removed from test cart");
        setTestCart(testCart.filter((item) => item.id !== itemId));
      } catch (err) {
        console.error("❌ Failed to remove from test cart, falling back to localStorage:", {
          message: err instanceof Error ? err.message : String(err),
          fullError: err
        });
        // Fallback to local storage
        const updatedCart = testCart.filter((item) => item.id !== itemId);
        saveGuestTestCart(updatedCart);
        setTestCart(updatedCart);
      }
    } else {
      // Remove from local storage for guests
      const updatedCart = testCart.filter((item) => item.id !== itemId);
      saveGuestTestCart(updatedCart);
      setTestCart(updatedCart);
    }
  }, [testCart, user?.id]);

  const clearTestCart = useCallback(async () => {
    if (user?.id) {
      // Clear from database for authenticated users
      try {
        const { error } = await supabase
          .from('test_carts')
          .delete()
          .eq('user_id', user.id);

        if (error) {
          console.error("❌ Error clearing test cart:", {
            message: error.message,
            code: error.code,
            fullError: error
          });
          throw error;
        }

        console.log("✅ Test cart cleared");
        setTestCart([]);
      } catch (err) {
        console.error("❌ Failed to clear test cart, falling back to localStorage:", {
          message: err instanceof Error ? err.message : String(err),
          fullError: err
        });
        // Fallback to local storage
        localStorage.removeItem('testCart');
        setTestCart([]);
      }
    } else {
      // Clear from local storage for guests
      localStorage.removeItem('testCart');
      setTestCart([]);
    }
  }, [user?.id]);

  const value = {
    testCart,
    addToTestCart,
    removeFromTestCart,
    clearTestCart,
    loading,
  };

  return (
    <TestCartContext.Provider value={value}>
      {children}
    </TestCartContext.Provider>
  );
}

export function useTestCart() {
  const context = useContext(TestCartContext);
  if (!context) {
    throw new Error('useTestCart must be used within TestCartProvider');
  }
  return context;
}
