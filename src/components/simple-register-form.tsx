"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const step1Schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const step2Schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type Step1FormData = z.infer<typeof step1Schema>;
type Step2FormData = z.infer<typeof step2Schema>;

export function SimpleRegisterForm() {
  const [step, setStep] = useState(1);
  const [setupToken, setSetupToken] = useState("");
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const step1Form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
  });

  const step2Form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
  });

  const onStep1Submit = async (values: Step1FormData) => {
    setIsLoading(true);
    try {
      console.log('Step 1: Creating account profile');
      
      const response = await fetch('/api/activate-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account');
      }
      
      console.log('Profile activated:', result);
      setSetupToken(result.setupToken);
      setProfileData(result.profile);
      setStep(2);
      
      toast({
        title: "Account Created!",
        description: "Now please set up your login credentials.",
      });
      
    } catch (error: any) {
      console.error('Step 1 error:', error);
      toast({
        title: "Validation Failed",
        description: error.message || "Please check your email address.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onStep2Submit = async (values: Step2FormData) => {
    setIsLoading(true);
    try {
      console.log('Step 2: Completing account setup');
      
      const response = await fetch('/api/complete-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: step1Form.getValues('email'),
          password: values.password,
          setupToken,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to complete account setup');
      }
      
      console.log('Account setup completed:', result);
      
      toast({
        title: "Account Created Successfully!",
        description: "You can now log in with your credentials.",
      });
      
      // Reset forms
      step1Form.reset();
      step2Form.reset();
      setStep(1);
      setSetupToken("");
      setProfileData(null);
      
      // Redirect to login
      window.location.href = "/login?message=account_created";
      
    } catch (error: any) {
      console.error('Step 2 error:', error);
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to complete account setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {step === 1 ? "Create Your Account" : "Set Up Login Credentials"}
        </CardTitle>
        <CardDescription>
          {step === 1 
            ? "Enter your email address to create your account"
            : `Welcome ${profileData?.name}! Please create your login password.`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 ? (
          <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                {...step1Form.register("email")}
                disabled={isLoading}
              />
              {step1Form.formState.errors.email && (
                <p className="text-sm text-red-600">
                  {step1Form.formState.errors.email.message}
                </p>
              )}
            </div>



            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...step2Form.register("password")}
                disabled={isLoading}
              />
              {step2Form.formState.errors.password && (
                <p className="text-sm text-red-600">
                  {step2Form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                {...step2Form.register("confirmPassword")}
                disabled={isLoading}
              />
              {step2Form.formState.errors.confirmPassword && (
                <p className="text-sm text-red-600">
                  {step2Form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setStep(1);
                  setSetupToken("");
                  setProfileData(null);
                }}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}