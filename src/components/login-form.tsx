
"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { signInWithEmail, signInWithGoogle } from "@/lib/supabase-auth";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/types";
import { useCart } from "@/hooks/use-cart";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

interface LoginFormProps {
  router: AppRouterInstance;
}

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);


export function LoginForm({ router }: LoginFormProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const { toast } = useToast();

  // Show success messages from registration
  useEffect(() => {
    const message = searchParams.get('message');
    if (message === 'registration_success') {
      toast({
        title: "Registration Successful!",
        description: "Your account has been created. Please log in with your credentials.",
      });
    } else if (message === 'instructor_pending') {
      toast({
        title: "Registration Submitted!",
        description: "Your instructor application is pending approval. You'll receive an email when approved.",
      });
    }
  }, [searchParams, toast]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
        const { data, error } = await signInWithGoogle();
        if (error) {
          throw error;
        }
        // Google OAuth will redirect, so we don't need to handle success here
    } catch (error: unknown) {
         const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
         toast({
            variant: "destructive",
            title: "Google Sign-In Failed",
            description: errorMessage,
        });
    } finally {
        setIsGoogleLoading(false);
    }
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      clearCart();
      const { data, error, userData } = await signInWithEmail(values.email, values.password);
      
      if (error) {
        throw error;
      }

      if (!userData) {
        throw new Error('User data not found');
      }

      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting...",
      });

      // Redirect based on role
      const role = userData.role;
      if (role === 'admin') {
        router.push("/admin/dashboard");
      } else if (role === 'instructor') {
        router.push("/instructor/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    } catch (error: unknown) {
      let errorMessage = "An unknown error occurred. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>
          Enter your email below to log in to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} autoComplete="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                   <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link href="/forgot-password" className="text-sm underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <FormControl>
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            autoComplete="current-password"
                        />
                    </FormControl>
                    <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                    </span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {form.formState.isSubmitting ? "Logging in..." : "Log In"}
            </Button>
          </form>
        </Form>
        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                </span>
            </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isGoogleLoading}>
          {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
          Sign in with Google
        </Button>
      </CardContent>
       <CardFooter className="flex-col gap-4">
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="underline">
            Sign up
          </Link>
        </div>
        <div className="text-center text-sm">
            <Link href="/" className="underline text-muted-foreground hover:text-foreground">
                &larr; Back to Home
            </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
