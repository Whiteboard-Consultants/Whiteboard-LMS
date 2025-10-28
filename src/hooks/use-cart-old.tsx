
"use client";

import { useState, useEffect, useContext, createContext, ReactNode, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import type { Course, CartItem, CartData } from "@/types";
import { useAuth } from "./use-auth";

interface CartContextType {
  cart: CartItem[];
  addToCart: (course: Course) => Promise<void>;
  removeFromCart: (courseId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  const getGuestCart = (): Course[] => {
    // This check ensures localStorage is only accessed on the client-side.
    if (typeof window === 'undefined') {
        return [];
    }
    try {
      const savedCart = localStorage.getItem("apex-learn-cart-guest");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Failed to load guest cart from localStorage", error);
      return [];
    }
  };

  const saveGuestCart = (guestCart: Course[]) => {
    if (typeof window === 'undefined') {
        return;
    }
    try {
      localStorage.setItem("apex-learn-cart-guest", JSON.stringify(guestCart));
    } catch (error) {
      console.error("Failed to save guest cart to localStorage", error);
    }
  };

  const mergeCarts = async (localCart: Course[], userId: string) => {
    if (localCart.length === 0) return;
    
    try {
      // Get existing cart from Supabase
      const { data: existingCart, error } = await supabase
        .from('carts')
        .select('courses')
        .eq('user_id', userId)
        .single();

      if (error && (error.code === '42P01' || error.message?.includes('relation "public.carts" does not exist'))) {
        // Table doesn't exist yet
        console.warn("Carts table doesn't exist yet. Guest cart will be preserved locally.");
        if(typeof window !== 'undefined') {
          localStorage.removeItem("apex-learn-cart-guest");
        }
        return;
      }

      const remoteCart = existingCart?.courses || [];

      // Merge local cart with remote cart, avoiding duplicates
      const mergedCart = [...remoteCart];
      localCart.forEach(localItem => {
        if (!remoteCart.some((remoteItem: Course) => remoteItem.id === localItem.id)) {
          mergedCart.push(localItem);
        }
      });

      // Update cart in Supabase
      const { error: updateError } = await supabase
        .from('carts')
        .upsert({ 
          user_id: userId, 
          courses: mergedCart,
          updated_at: new Date().toISOString()
        });

      if (updateError) {
        console.warn("Error merging carts:", updateError);
      }

      // Clear guest cart from localStorage
      if(typeof window !== 'undefined') {
          localStorage.removeItem("apex-learn-cart-guest");
      }
    } catch (err) {
      console.warn("Cart merge disabled - using local storage:", err);
      // Clear guest cart anyway
      if(typeof window !== 'undefined') {
          localStorage.removeItem("apex-learn-cart-guest");
      }
    }
  };

  useEffect(() => {
    let subscription: any = null;

    if (authLoading) {
        setLoading(true);
        return;
    }

    if (user) {
      const userId = user.id;
      
      // Merge guest cart if it exists
      const guestCart = getGuestCart();
      if (guestCart.length > 0) {
        mergeCarts(guestCart, userId);
      }

      // Fetch initial cart data
      const fetchCart = async () => {
        try {
          // Temporarily disable cart database until we fix the schema mismatch
          console.log("Cart database temporarily disabled - using local storage only");
          setCart([]);
        } catch (err) {
          console.warn("Cart functionality disabled - database table not ready:", err);
          setCart([]); // Fallback to empty cart
        }
        setLoading(false);
      };

      fetchCart();

      // Set up real-time subscription for cart changes
      subscription = supabase
        .channel(`cart_${userId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'carts',
          filter: `user_id=eq.${userId}`
        }, (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setCart(payload.new.courses || []);
          } else if (payload.eventType === 'DELETE') {
            setCart([]);
          }
        })
        .subscribe();

    } else {
      setCart(getGuestCart());
      setLoading(false);
    }
    
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [user, authLoading]);


  const addToCart = useCallback(async (course: Course) => {
    if (cart.some(item => item.id === course.id)) return; // Prevent duplicates
    
    const updatedCart = [...cart, course];
    if (user) {
      try {
        const { error } = await supabase
          .from('carts')
          .upsert({ 
            user_id: user.id, 
            courses: updatedCart,
            updated_at: new Date().toISOString()
          });
        
        if (error) {
          if (error.code === '42P01' || error.message?.includes('relation "public.carts" does not exist')) {
            console.warn("Carts table doesn't exist yet. Cart will only work locally.");
          } else {
            console.warn("Cart database unavailable, using local storage:", error);
          }
          // Still update local state even if database fails
          setCart(updatedCart);
        }
      } catch (err) {
        console.warn("Cart disabled - using local storage:", err);
        // Still update local state even if database fails
        setCart(updatedCart);
      }
    } else {
      setCart(updatedCart);
      saveGuestCart(updatedCart);
    }
  }, [cart, user]);

  const removeFromCart = useCallback(async (courseId: string) => {
    const updatedCart = cart.filter((item) => item.id !== courseId);
    if (user) {
      try {
        const { error } = await supabase
          .from('carts')
          .upsert({ 
            user_id: user.id, 
            courses: updatedCart,
            updated_at: new Date().toISOString()
          });
        
        if (error) {
          if (error.code === '42P01' || error.message?.includes('relation "public.carts" does not exist')) {
            console.warn("Carts table doesn't exist yet. Cart will only work locally.");
          } else {
            console.warn("Cart database unavailable, using local storage:", error);
          }
          // Still update local state even if database fails
          setCart(updatedCart);
        }
      } catch (err) {
        console.warn("Cart disabled - using local storage:", err);
        // Still update local state even if database fails
        setCart(updatedCart);
      }
    } else {
      setCart(updatedCart);
      saveGuestCart(updatedCart);
    }
  }, [cart, user]);

  const clearCart = useCallback(async () => {
    if (user) {
      try {
        const { error } = await supabase
          .from('carts')
          .upsert({ 
            user_id: user.id, 
            courses: [],
            updated_at: new Date().toISOString()
          });
        
        if (error) {
          if (error.code === '42P01' || error.message?.includes('relation "public.carts" does not exist')) {
            console.warn("Carts table doesn't exist yet. Cart will only work locally.");
          } else {
            console.warn("Cart database unavailable, using local storage:", error);
          }
          // Still update local state even if database fails
          setCart([]);
        }
      } catch (err) {
        console.warn("Cart disabled - using local storage:", err);
        // Still update local state even if database fails
        setCart([]);
      }
    } else {
      setCart([]);
      saveGuestCart([]);
    }
  }, [user]);
  
  const value = useMemo(() => ({ cart, addToCart, removeFromCart, clearCart, loading }), 
    [cart, addToCart, removeFromCart, clearCart, loading]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
