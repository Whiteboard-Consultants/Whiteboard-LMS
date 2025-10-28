
'use client';

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Instagram, Linkedin, Youtube, Facebook, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { saveContactSubmission } from "@/app/contact/actions";

const formSchema = z.object({
  firstName: z.string().min(1, "First Name is required."),
  lastName: z.string().min(1, "Last Name is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().min(10, "A valid phone number is required."),
  inquiryType: z.string().min(1, "Please select a service."),
  message: z.string().optional(),
});

export default function ContactPageClient() {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            inquiryType: "",
            message: "",
        },
    });

    const { isSubmitting } = form.formState;

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const result = await saveContactSubmission(values);
        if (result.success) {
            toast({
                title: "Message Sent!",
                description: "Thank you for reaching out. We will get back to you shortly.",
            });
            form.reset();
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error,
            });
        }
    }


  return (
    <>
      <section className="bg-slate-100 dark:bg-slate-dark py-16 sm:py-24">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Get in Touch With <span className="text-primary dark:text-white">Whiteboard Consultants</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                We&apos;re here to help you with all your educational and career needs. Whether you have a question about studying abroad, test preparation, or career counseling, our team is ready to provide expert guidance and support.
              </p>
            </div>
            <div className="relative h-80 w-full overflow-hidden rounded-lg shadow-xl">
              <Image
                src="https://images.pexels.com/photos/209695/pexels-photo-209695.jpeg"
                alt="A vintage gray rotary telephone on a wooden surface, symbolizing contact and communication."
                fill
                className="object-cover"
                data-ai-hint="rotary telephone"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-background dark:bg-black">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold font-headline mb-4">Contact Information</h2>
              <p className="text-muted-foreground mb-8">
                Reach out to us through any of the following channels. We look forward to hearing from you!
              </p>
              <Card className="bg-muted/50 dark:bg-slate-dark border-0">
                <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Mail className="h-6 w-6 text-primary dark:text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Email Us</h3>
                        <a href="mailto:info@whiteboardconsultant.com" className="text-muted-foreground hover:text-primary dark:hover:text-white">
                          info@whiteboardconsultant.com
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Phone className="h-6 w-6 text-primary dark:text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Call Us</h3>
                        <a href="tel:+918583035656" className="text-muted-foreground hover:text-primary dark:hover:text-white">
                          +91 85830 35656
                        </a>
                      </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <MapPin className="h-6 w-6 text-primary dark:text-primary-foreground" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Our Location</h3>
                            <p className="text-muted-foreground dark:text-white/80">
                                Serving students across India
                            </p>
                        </div>
                    </div>
                    <a href="https://maps.app.goo.gl/tBzDnPjy8kUcPYga6" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <MapPin className="h-6 w-6 text-primary dark:text-primary-foreground" />
                        </div>
                        <div>
                            <h3 className="font-semibold">City Office</h3>
                            <p className="text-muted-foreground group-hover:text-primary group-hover:underline dark:group-hover:text-white">
                                &apos;My Cube&apos;, 6th Floor, Park Plaza,<br />
                                71, Park Street,<br />
                                Kolkata - 700 016
                            </p>
                        </div>
                    </a>
                </CardContent>
              </Card>
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                    <Link href="https://www.instagram.com/whiteboardconsultants" className="text-muted-foreground hover:text-primary dark:hover:text-white"><Instagram className="h-6 w-6" /></Link>
                    <Link href="https://www.linkedin.com/company/whiteboard-consultant" className="text-muted-foreground hover:text-primary dark:hover:text-white"><Linkedin className="h-6 w-6" /></Link>
                    <Link href="https://www.youtube.com/@Whiteboard-Consultants" className="text-muted-foreground hover:text-primary dark:hover:text-white"><Youtube className="h-6 w-6" /></Link>
                    <Link href="https://www.facebook.com/whiteboardconsultants" className="text-muted-foreground hover:text-primary dark:hover:text-white"><Facebook className="h-6 w-6" /></Link>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold font-headline mb-4">Send Us a Message</h2>
              <p className="text-muted-foreground mb-8">
                Have a specific question? Fill out the form below, and one of our expert counselors will get back to you shortly.
              </p>
              <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField control={form.control} name="firstName" render={({ field }) => (
                      <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="John" autoComplete="given-name" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="lastName" render={({ field }) => (
                      <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Doe" autoComplete="family-name" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                 <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="john.doe@example.com" autoComplete="email" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="+91 12345 67890" autoComplete="tel" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="inquiryType" render={({ field }) => (
                    <FormItem><FormLabel>How can we help you?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Study Abroad">Study Abroad</SelectItem>
                                <SelectItem value="UOW Admissions">UOW Admissions</SelectItem>
                                <SelectItem value="College Admissions">College Admissions</SelectItem>
                                <SelectItem value="Test Preparation">Test Preparation</SelectItem>
                                <SelectItem value="Communication Skills">Communication Skills</SelectItem>
                                <SelectItem value="SMAT/ SSAT Preparations">SMAT/ SSAT Preparations</SelectItem>
                                <SelectItem value="Career Development">Career Development</SelectItem>
                                <SelectItem value="General Enquiry">General Enquiry</SelectItem>
                            </SelectContent>
                        </Select>
                    <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem><FormLabel>Message</FormLabel><FormControl><Textarea placeholder="Tell us more about your inquiry..." className="min-h-[150px]" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div>
                  <Button type="submit" size="lg" className="w-full dark:border dark:border-white" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </form>
              </Form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
