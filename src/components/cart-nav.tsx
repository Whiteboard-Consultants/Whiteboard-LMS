
"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { useCart } from "@/hooks/use-cart";
import { useTestCart } from "@/hooks/use-test-cart";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function CartNav() {
  const { cart } = useCart();
  const { testCart } = useTestCart();
  const { userData } = useAuth();
  
  if (userData?.role !== 'student') {
      return null;
  }

  const totalItems = cart.length + testCart.length;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white font-bold">
              {totalItems}
            </span>
          )}
          <span className="sr-only">Shopping Carts</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/cart" className="cursor-pointer">
            Courses Cart ({cart.length})
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/student/test-cart" className="cursor-pointer">
            Tests Cart ({testCart.length})
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          {totalItems === 0 ? 'Your carts are empty' : `${totalItems} item${totalItems !== 1 ? 's' : ''} total`}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
