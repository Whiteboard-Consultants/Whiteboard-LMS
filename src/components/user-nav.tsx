

"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { Skeleton } from "./ui/skeleton";
import { LogIn, LogOut, Settings, UserPlus, UserCircle, ChevronDown } from "lucide-react";
import { useSidebar } from "./ui/sidebar";
import { useCart } from "@/hooks/use-cart";
import { ThemeToggle } from "./theme-toggle";
import { signOut } from "@/lib/supabase-auth";

export function UserNav() {
  const { user, userData, loading, isClient } = useAuth();
  const { clearCart } = useCart();
  const { isMobile } = useSidebar();
  const router = useRouter();
  
  const handleLogout = async () => {
    try {
      console.log('🔄 Starting logout process...');
      
      // Step 1: Clear cart first (while user is still authenticated)
      try {
        await clearCart();
        console.log('✅ Cart cleared successfully');
      } catch (cartError) {
        console.warn('⚠️ Failed to clear cart:', cartError);
        // Continue with logout even if cart clearing fails
      }
      
      // Step 2: Sign out from authentication
      console.log('🔄 Signing out from authentication...');
      const result = await signOut();
      
      if (result.error) {
        console.error('❌ Logout error:', result.error);
        // Don't throw - continue with navigation to ensure user gets logged out
      } else {
        console.log('✅ Authentication sign out successful');
      }
      
      // Step 3: Navigate to home page - use window.location for immediate effect
      console.log('🔄 Navigating to home page...');
      window.location.href = '/';
      
    } catch (error) {
      console.error('❌ Logout process failed:', error);
      
      // Force navigation even on complete failure to ensure user experience
      console.log('🔄 Force navigating to home page...');
      window.location.href = '/';
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Prevent hydration mismatch - this should be handled by UserActions component
  if (!isClient) {
    return null;
  }

    // Logged-out user state
    if (!user) {
        // For mobile sidebar, show separate links
        if (isMobile) {
            return (
                <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold pl-2">Theme</span>
                        <ThemeToggle />
                    </div>
                    <DropdownMenuSeparator />
                    <Button asChild variant="ghost" className="justify-start hover:bg-primary-foreground/10 hover:text-primary-foreground">
                        <Link href="/register">
                            <UserPlus className="mr-2 h-5 w-5" />
                            Register
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" className="justify-start hover:bg-primary-foreground/10 hover:text-primary-foreground">
                        <Link href="/login">
                            <LogIn className="mr-2 h-5 w-5" />
                            Login
                        </Link>
                    </Button>
                </div>
            );
        }
        // For desktop, show the "Account" dropdown
        return (
            <div className="flex items-center gap-2 transition-opacity duration-200">
                <ThemeToggle />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground min-w-[112px] transition-all duration-200">
                            <UserCircle className="h-5 w-5" />
                            <span className="ml-2">Account</span>
                            <ChevronDown className="h-4 w-4 ml-1 -mr-1" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-auto min-w-[12rem]" align="end" forceMount>
                        <DropdownMenuItem asChild>
                            <Link href="/register">
                                <UserPlus className="mr-2 h-4 w-4" />
                                <span>Register</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/login">
                                <LogIn className="mr-2 h-4 w-4" />
                                <span>Log In</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        );
    }
  
  const role = userData?.role || 'student';

  // Specific buttons for mobile sidebar (logged-in state)
  if (isMobile) {
    return (
        <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold pl-2">Theme</span>
                <ThemeToggle />
            </div>
            <DropdownMenuSeparator />
            <Button asChild variant="ghost" className="justify-start hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link href={`/${role}/dashboard`}>
                    <UserCircle className="mr-2 h-5 w-5" />
                    My Dashboard
                </Link>
            </Button>
            <Button asChild variant="ghost" className="justify-start hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link href="/settings">
                    <Settings className="mr-2 h-5 w-5" />
                    Settings
                </Link>
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="justify-start text-destructive hover:bg-destructive/10 hover:text-destructive dark:text-red-400 dark:hover:text-red-400">
                <LogOut className="mr-2 h-5 w-5" />
                Log out
            </Button>
        </div>
    )
  }

  // Dropdown with Avatar for desktop (logged-in state)
  return (
    <div className="flex items-center gap-2 transition-opacity duration-200">
        <ThemeToggle />
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full min-w-[32px] transition-all duration-200">
            <Avatar className="h-8 w-8">
                <AvatarImage src={user.user_metadata?.avatar_url || undefined} alt={userData?.name || 'User'} />
                <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground font-semibold">{getInitials(userData?.name)}</AvatarFallback>
            </Avatar>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-auto min-w-[14rem]" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userData?.name || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                {user.email}
                </p>
            </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
            <DropdownMenuItem asChild>
                <Link href={`/${role}/dashboard`}>Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive dark:text-red-400 dark:focus:bg-red-800/30 dark:focus:text-red-400">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
            </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
    </div>
  );
}
