"use client";

import { useState, useEffect, useContext, createContext, ReactNode, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./use-auth";

export interface TestCartItem {
  /** Product id: test id for individual, series id for series packages */
  id: string;
  /** DB row id — preferred for React keys / precise deletes */
  cartRowId?: string;
  title: string;
  price: number;
  type: 'individual' | 'series';
  seriesId?: string;
  image?: string;
  addedAt?: string;
}

/** Stable unique key for list rendering (same test can appear as both types). */
export function testCartItemKey(item: TestCartItem): string {
  return item.cartRowId || `${item.id}:${item.type}`;
}

function dedupeCartItems(items: TestCartItem[]): TestCartItem[] {
  const seen = new Set<string>();
  const result: TestCartItem[] = [];
  for (const item of items) {
    const key = `${item.id}:${item.type}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

interface TestCartContextType {
  testCart: TestCartItem[];
  addToTestCart: (item: TestCartItem) => Promise<void>;
  removeFromTestCart: (item: TestCartItem | string) => Promise<void>;
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

  // Process pending cart items after login (from unauthenticated add-to-cart)
  useEffect(() => {
    const processPendingCartItem = async () => {
      if (!user?.id) return;

      try {
        const pendingItem = localStorage.getItem('pendingCartItem');
        const pendingAction = localStorage.getItem('pendingCartAction');

        if (pendingItem && pendingAction === 'add') {
          const cartItem = JSON.parse(pendingItem) as TestCartItem;

          // Clear first so React Strict Mode / remounts don't double-insert
          localStorage.removeItem('pendingCartItem');
          localStorage.removeItem('pendingCartAction');

          const { error } = await supabase
            .from('test_carts')
            .insert({
              user_id: user.id,
              test_id: cartItem.id,
              test_title: cartItem.title,
              test_price: cartItem.price,
              test_type: cartItem.type,
              series_id: cartItem.seriesId || null,
              test_image: cartItem.image || null,
            });

          if (error) {
            if (error.code === '23505' || error.message?.includes('unique')) {
              console.warn('⚠️ Item already in cart');
            } else {
              console.error('❌ Failed to add pending item to cart:', error);
              return;
            }
          }

          await loadTestCart();
        }
      } catch (error) {
        console.error('Error processing pending cart item:', error);
        localStorage.removeItem('pendingCartItem');
        localStorage.removeItem('pendingCartAction');
      }
    };

    processPendingCartItem();
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
          setTestCart(dedupeCartItems(getGuestTestCart()));
        } else {
          const cartItems = cartData?.map(item => ({
            id: item.test_id,
            cartRowId: item.id,
            title: item.test_title,
            price: item.test_price,
            type: item.test_type as 'individual' | 'series',
            seriesId: item.series_id || undefined,
            image: item.test_image || undefined,
            addedAt: item.added_at
          })) || [];
          setTestCart(dedupeCartItems(cartItems));
        }
      } catch (err) {
        console.warn("Test cart functionality disabled - using local storage:", err);
        setTestCart(dedupeCartItems(getGuestTestCart()));
      }
    } else {
      // Load from local storage for guests
      setTestCart(dedupeCartItems(getGuestTestCart()));
    }

    setLoading(false);
  }, [user?.id]);

  const addToTestCart = useCallback(async (item: TestCartItem) => {
    const alreadyInCart = testCart.some(
      (existing) => existing.id === item.id && existing.type === item.type
    );
    if (alreadyInCart) {
      return;
    }

    if (user?.id) {
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
          
          if (
            error.code === '42P01' ||
            error.code === '42000' ||
            error.code === '23505' ||
            error.code === '42883' ||
            error.message?.includes('test_carts') ||
            error.message?.includes('permission') ||
            error.message?.includes('unique')
          ) {
            if (error.code === '23505' || error.message?.includes('unique')) {
              console.warn("⚠️ Item already in cart, reloading from database");
              await loadTestCart();
              return;
            } else {
              console.warn("⚠️ test_carts table not ready or RLS issue, using localStorage fallback");
              const updatedCart = dedupeCartItems([...testCart, item]);
              saveGuestTestCart(updatedCart);
              setTestCart(updatedCart);
              return;
            }
          }
          throw error;
        }

        await loadTestCart();
      } catch (err) {
        console.error("❌ Failed to add to test cart, falling back to localStorage:", {
          message: err instanceof Error ? err.message : String(err),
          fullError: err
        });
        const updatedCart = dedupeCartItems([...testCart, item]);
        saveGuestTestCart(updatedCart);
        setTestCart(updatedCart);
      }
    } else {
      const updatedCart = dedupeCartItems([...testCart, item]);
      saveGuestTestCart(updatedCart);
      setTestCart(updatedCart);
    }
  }, [testCart, user?.id, loadTestCart]);

  const removeFromTestCart = useCallback(async (itemOrId: TestCartItem | string) => {
    const item =
      typeof itemOrId === 'string'
        ? testCart.find((c) => c.id === itemOrId) || { id: itemOrId, type: 'individual' as const, title: '', price: 0 }
        : itemOrId;

    if (user?.id) {
      try {
        let query = supabase
          .from('test_carts')
          .delete()
          .eq('user_id', user.id);

        if (item.cartRowId) {
          query = query.eq('id', item.cartRowId);
        } else {
          query = query.eq('test_id', item.id).eq('test_type', item.type);
        }

        const { error } = await query;

        if (error) {
          console.error("❌ Error removing from test cart:", {
            message: error.message,
            code: error.code,
            fullError: error
          });
          throw error;
        }

        setTestCart(
          testCart.filter((c) => testCartItemKey(c) !== testCartItemKey(item as TestCartItem))
        );
      } catch (err) {
        console.error("❌ Failed to remove from test cart, falling back to localStorage:", {
          message: err instanceof Error ? err.message : String(err),
          fullError: err
        });
        const updatedCart = testCart.filter(
          (c) => !(c.id === item.id && c.type === item.type)
        );
        saveGuestTestCart(updatedCart);
        setTestCart(updatedCart);
      }
    } else {
      const updatedCart = testCart.filter(
        (c) => !(c.id === item.id && c.type === item.type)
      );
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
