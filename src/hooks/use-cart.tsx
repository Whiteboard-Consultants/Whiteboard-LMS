"use client";

import { useState, useEffect, useContext, createContext, ReactNode, useCallback } from "react";
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

// Helper function to convert Course to CartItem
function courseToCartItem(course: Course): CartItem {
  return {
    id: course.id,
    title: course.title,
    price: course.price || 0,
    image: course.imageUrl,
    quantity: 1,
    instructor: course.instructor ? {
      id: course.instructor.id,
      name: course.instructor.name
    } : undefined
  };
}

// Helper function to convert CartData to CartItem
function cartDataToCartItem(cartData: CartData): CartItem {
  return {
    id: cartData.course_id,
    title: cartData.course_title,
    price: cartData.course_price,
    image: cartData.course_image,
    quantity: cartData.quantity
  };
}

// Guest cart functions (local storage)
function getGuestCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const savedCart = localStorage.getItem("whitedge-cart-guest");
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error("Failed to load guest cart from localStorage", error);
    return [];
  }
}

function saveGuestCart(cart: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem("whitedge-cart-guest", JSON.stringify(cart));
  } catch (error) {
    console.error("Failed to save guest cart to localStorage", error);
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, userData } = useAuth();

  // Load cart on mount and when user changes
  useEffect(() => {
    loadCart();
  }, [user?.id]);

  const loadCart = useCallback(async () => {
    setLoading(true);
    
    if (user?.id) {
      // Load from database for authenticated users
      try {
        const { data: cartData, error } = await supabase
          .from('carts')
          .select('id, course_id, course_title, course_price, course_image, course_instructor_id, course_instructor_name, quantity, added_at')
          .eq('user_id', user.id);

        if (error) {
          console.warn("Cart database unavailable, using local storage:", error.message);
          setCart(getGuestCart());
        } else {
          const cartItems = cartData?.map(item => ({
            id: item.course_id,
            title: item.course_title,
            price: item.course_price,
            image: item.course_image,
            quantity: item.quantity,
            instructor: item.course_instructor_id && item.course_instructor_name ? {
              id: item.course_instructor_id,
              name: item.course_instructor_name
            } : undefined
          })) || [];
          setCart(cartItems);
        }
      } catch (err) {
        console.warn("Cart functionality disabled - using local storage:", err);
        setCart(getGuestCart());
      }
    } else {
      // Load from local storage for guests
      setCart(getGuestCart());
    }
    
    setLoading(false);
  }, [user?.id]);

  const addToCart = useCallback(async (course: Course) => {
    const cartItem = courseToCartItem(course);
    
    if (user?.id) {
      // Add to database for authenticated users
      try {
        const { error } = await supabase
          .from('carts')
          .insert({
            user_id: user.id,
            course_id: course.id,
            course_title: course.title,
            course_price: course.price || 0,
            course_image: course.imageUrl,
            course_instructor_id: course.instructor?.id,
            course_instructor_name: course.instructor?.name,
            quantity: 1
          });

        if (error) {
          console.warn("Failed to add to database cart, using local storage:", error.message);
          // Fallback to local storage
          const updatedCart = [...cart, cartItem];
          setCart(updatedCart);
          saveGuestCart(updatedCart);
        } else {
          // Reload cart from database
          await loadCart();
        }
      } catch (err) {
        console.warn("Cart database error, using local storage:", err);
        const updatedCart = [...cart, cartItem];
        setCart(updatedCart);
        saveGuestCart(updatedCart);
      }
    } else {
      // Add to local storage for guests
      const updatedCart = [...cart, cartItem];
      setCart(updatedCart);
      saveGuestCart(updatedCart);
    }
  }, [cart, user?.id, loadCart]);

  const removeFromCart = useCallback(async (courseId: string) => {
    if (user?.id) {
      // Remove from database for authenticated users
      try {
        const { error } = await supabase
          .from('carts')
          .delete()
          .eq('user_id', user.id)
          .eq('course_id', courseId);

        if (error) {
          console.warn("Failed to remove from database cart, using local storage:", error.message);
          // Fallback to local storage
          const updatedCart = cart.filter(item => item.id !== courseId);
          setCart(updatedCart);
          saveGuestCart(updatedCart);
        } else {
          // Reload cart from database
          await loadCart();
        }
      } catch (err) {
        console.warn("Cart database error, using local storage:", err);
        const updatedCart = cart.filter(item => item.id !== courseId);
        setCart(updatedCart);
        saveGuestCart(updatedCart);
      }
    } else {
      // Remove from local storage for guests
      const updatedCart = cart.filter(item => item.id !== courseId);
      setCart(updatedCart);
      saveGuestCart(updatedCart);
    }
  }, [cart, user?.id, loadCart]);

  const clearCart = useCallback(async () => {
    if (user?.id) {
      // Clear database cart for authenticated users
      try {
        const { error } = await supabase
          .from('carts')
          .delete()
          .eq('user_id', user.id);

        if (error) {
          console.warn("Failed to clear database cart, clearing local storage:", error.message);
        }
      } catch (err) {
        console.warn("Cart database error:", err);
      }
    }
    
    // Always clear local cart
    setCart([]);
    saveGuestCart([]);
  }, [user?.id]);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    loading
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}