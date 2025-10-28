
"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";

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
import { sendPasswordReset } from "@/app/auth/actions";
import { useState } from "react";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
});

export function ForgotPasswordForm() {
  const { toast } = useToast();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await sendPasswordReset(values.email);
    if (result.success) {
      toast({
        title: "Check your email",
        description: "A password reset link has been sent to your email address.",
      });
      setFormSubmitted(true);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  }

  if (formSubmitted) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Request Sent</CardTitle>
                <CardDescription>
                    If an account exists for the email you entered, a reset link has been sent. Please check your inbox and spam folder.
                </CardDescription>
            </CardHeader>
            <CardFooter>
                 <Button asChild className="w-full">
                    <Link href="/login">Back to Log In</Link>
                </Button>
            </CardFooter>
        </Card>
    );
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Forgot Your Password?</CardTitle>
        <CardDescription>
          No problem. Enter your email address and we&apos;ll send you a link to reset it.
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
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </Form>
      </CardContent>
       <CardFooter className="flex-col gap-4">
        <div className="text-center text-sm">
          Remembered your password?{" "}
          <Link href="/login" className="underline">
            Log in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
