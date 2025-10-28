
"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { useCart } from "@/hooks/use-cart";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/use-auth";

export function CartNav() {
  const { cart } = useCart();
  const { userData } = useAuth();
  
  if (userData?.role !== 'student') {
      return null;
  }
  
  return (
    <Button asChild variant="ghost" className="relative text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground">
      <Link href="/cart">
        <ShoppingCart className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
          {cart.length}
        </span>
        <span className="sr-only">View Cart</span>
      </Link>
    </Button>
  );
}
