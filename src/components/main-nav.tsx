
"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import React from "react";
import { Globe, University } from "lucide-react";

const studyAbroadDestinations: { title: string; href: string; description: string }[] = [
    {
        title: "Study in Ireland",
        href: "/study-abroad/ireland",
        description: "Experience the rich culture and high-quality education in the Emerald Isle.",
    },
    {
        title: "Study in UK",
        href: "/study-abroad/uk",
        description: "Access world-renowned universities and a vibrant student life.",
    },
    {
        title: "Study in Germany",
        href: "/study-abroad/germany",
        description: "Benefit from low-cost education and strong engineering programs.",
    },
    {
        title: "Study in USA",
        href: "/study-abroad/usa",
        description: "Explore diverse academic opportunities and cutting-edge research.",
    },
    {
        title: "Study in Canada",
        href: "/study-abroad/canada",
        description: "Enjoy a multicultural environment and a path to residency.",
    },
    {
        title: "Study in Australia",
        href: "/study-abroad/australia",
        description: "Combine top-tier education with a stunning natural landscape.",
    },
     {
        title: "Study in Dubai (UAE)",
        href: "/study-abroad/dubai",
        description: "Explore a global business hub with world-class infrastructure.",
    },
    {
        title: "Study in New Zealand",
        href: "/study-abroad/new-zealand",
        description: "Enjoy a safe environment and stunning natural beauty.",
    },
];

interface MainNavProps {
  isMobileLayout?: boolean;
}

export function MainNav({ isMobileLayout = false }: MainNavProps) {
  // Render mobile vertical menu when explicitly in mobile layout mode
  if (isMobileLayout) {
    return (
      <Accordion type="multiple" className="w-full">
        <div className="space-y-2">
          <div>
            <Link href="/" className="block px-2 py-2 text-sm font-medium rounded-md hover:bg-primary-foreground/10 transition-colors">
              Home
            </Link>
          </div>
          <div>
            <Link href="/about" className="block px-2 py-2 text-sm font-medium rounded-md hover:bg-primary-foreground/10 transition-colors">
              About
            </Link>
          </div>

          <AccordionItem value="study-abroad" className="border-b-0">
            <AccordionTrigger className="px-2 py-2 text-sm font-medium hover:bg-primary-foreground/10 rounded-md">Study Abroad</AccordionTrigger>
            <AccordionContent className="pl-4 pt-2 pb-2">
              <div className="space-y-2">
                <Link href="/study-abroad" className="block px-2 py-2 text-sm rounded-md hover:bg-primary-foreground/10 transition-colors">All Study Abroad</Link>
                {studyAbroadDestinations.map((dest) => (
                  <Link key={dest.title} href={dest.href} className="block px-2 py-2 text-sm rounded-md hover:bg-primary-foreground/10 transition-colors">
                    {dest.title}
                  </Link>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="admissions" className="border-b-0">
            <AccordionTrigger className="px-2 py-2 text-sm font-medium hover:bg-primary-foreground/10 rounded-md">Admissions</AccordionTrigger>
            <AccordionContent className="pl-4 pt-2 pb-2">
              <div className="space-y-2">
                <Link href="/admissions/uow-india" className="block px-2 py-2 text-sm rounded-md hover:bg-primary-foreground/10 transition-colors">UOW India Partner</Link>
                <Link href="/college-admissions" className="block px-2 py-2 text-sm rounded-md hover:bg-primary-foreground/10 transition-colors">College Admissions</Link>
              </div>
            </AccordionContent>
          </AccordionItem>

          <div>
            <Link href="/courses" className="block px-2 py-2 text-sm font-medium rounded-md hover:bg-primary-foreground/10 transition-colors">
              Online Courses
            </Link>
          </div>
          <div>
            <Link href="/blog" className="block px-2 py-2 text-sm font-medium rounded-md hover:bg-primary-foreground/10 transition-colors">
              Blog
            </Link>
          </div>
          <div>
            <Link href="/contact" className="block px-2 py-2 text-sm font-medium rounded-md hover:bg-primary-foreground/10 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </Accordion>
    );
  }

  // Desktop horizontal menu
  return (
    <NavigationMenu className="w-full relative">
        <NavigationMenuList className="justify-center max-w-none">
            <NavigationMenuItem>
                <NavigationMenuLink asChild>
                   <Link href="/" className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-primary-foreground/10 text-primary-foreground hover:text-primary-foreground focus:text-primary-foreground")}>Home</Link>
                </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <NavigationMenuLink asChild>
                    <Link href="/about" className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-primary-foreground/10 text-primary-foreground hover:text-primary-foreground focus:text-primary-foreground")}>About</Link>
                </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-primary-foreground/10 text-primary-foreground hover:text-primary-foreground focus:text-primary-foreground">Study Abroad</NavigationMenuTrigger>
                <NavigationMenuContent>
                    <ul className="grid w-[600px] p-4 md:w-[700px] lg:w-[800px] md:grid-cols-2 gap-4">
                        <li className="md:col-span-2">
                           <NavigationMenuLink asChild>
                                <Link
                                href="/study-abroad"
                                className="flex flex-col h-full justify-center rounded-lg bg-muted p-6 no-underline outline-none focus:shadow-md"
                               >
                                <Globe className="h-6 w-6" />
                                <div className="mb-2 mt-4 text-lg font-medium">
                                    Study Abroad
                                </div>
                                <p className="text-sm leading-tight text-muted-foreground">
                                    Explore top destinations, universities, and get expert guidance for your journey.
                                </p>
                               </Link>
                            </NavigationMenuLink>
                        </li>
                         {studyAbroadDestinations.map((destination) => (
                            <ListItem
                                key={destination.title}
                                title={destination.title}
                                href={destination.href}
                            >
                                {destination.description}
                            </ListItem>
                        ))}
                    </ul>
                </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-primary-foreground/10 text-primary-foreground hover:text-primary-foreground focus:text-primary-foreground">Admissions</NavigationMenuTrigger>
                <NavigationMenuContent>
                     <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                        <li className="row-span-2">
                            <NavigationMenuLink asChild>
                            <Link
                                href="/college-admissions"
                                className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            >
                                <University className="h-6 w-6" />
                                <div className="mb-2 mt-4 text-lg font-medium">
                                    Admissions
                                </div>
                                <p className="text-sm leading-tight text-muted-foreground">
                                    Your complete guide to the university admission process.
                                </p>
                            </Link>
                            </NavigationMenuLink>
                        </li>
                        <ListItem href="/admissions/uow-india" title="UOW India Partner">
                            Official East India partner for the University of Wollongong.
                        </ListItem>
                        <ListItem href="/college-admissions" title="College Admissions">
                            Expert guidance for top colleges across India.
                        </ListItem>
                    </ul>
                </NavigationMenuContent>
            </NavigationMenuItem>

             <NavigationMenuItem>
                <NavigationMenuLink asChild>
                    <Link href="/courses" className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-primary-foreground/10 text-primary-foreground hover:text-primary-foreground focus:text-primary-foreground")}>Online Courses</Link>
                </NavigationMenuLink>
            </NavigationMenuItem>
             <NavigationMenuItem>
                <NavigationMenuLink asChild>
                    <Link href="/blog" className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-primary-foreground/10 text-primary-foreground hover:text-primary-foreground focus:text-primary-foreground")}>Blog</Link>
                </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
                 <NavigationMenuLink asChild>
                    <Link href="/contact" className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-primary-foreground/10 text-primary-foreground hover:text-primary-foreground focus:text-primary-foreground")}>Contact Us</Link>
                 </NavigationMenuLink>
            </NavigationMenuItem>
        </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
