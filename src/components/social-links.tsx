
'use client';

import Link from "next/link";
import { Instagram, Linkedin, Youtube, Facebook } from "lucide-react";

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M16.6 14.2l-1.5-0.7c-0.3-0.1-0.5-0.1-0.7 0.1l-0.5 0.6c-1.4-0.8-2.6-2-3.4-3.4l0.6-0.5c0.2-0.2 0.2-0.4 0.1-0.7L10 8.1c-0.1-0.3-0.4-0.4-0.7-0.4h-1c-0.2 0-0.4 0.1-0.6 0.2c-0.2 0.2-0.7 0.7-0.7 1.6c0 0.1 0 0.1 0 0.1c0 0.1 0 0.1 0 0.1c0 0.4 0.1 0.7 0.2 1c0.3 0.6 0.7 1.3 1.3 1.9c0.9 0.9 1.9 1.6 3 2c0.3 0.1 0.6 0.2 1 0.2c0.9 0 1.4-0.5 1.6-0.7c0.1-0.2 0.2-0.4 0.2-0.6v-1C17 14.5 16.8 14.3 16.6 14.2zM12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2zM12 20.5c-4.7 0-8.5-3.8-8.5-8.5S7.3 3.5 12 3.5s8.5 3.8 8.5 8.5S16.7 20.5 12 20.5z" />
    </svg>
);

export function SocialLinks() {
  return (
    <div className="flex space-x-4">
        <Link href="https://www.instagram.com/whiteboardconsultants" className="text-primary-foreground/80 hover:text-primary-foreground dark:hover:text-white">
            <Instagram className="h-5 w-5" />
            <span className="sr-only">Instagram</span>
        </Link>
        <Link href="https://www.linkedin.com/company/whiteboard-consultant" className="text-primary-foreground/80 hover:text-primary-foreground dark:hover:text-white">
            <Linkedin className="h-5 w-5" />
            <span className="sr-only">LinkedIn</span>
        </Link>
        <Link href="https://www.youtube.com/@Whiteboard-Consultants" className="text-primary-foreground/80 hover:text-primary-foreground dark:hover:text-white">
            <Youtube className="h-5 w-5" />
            <span className="sr-only">YouTube</span>
        </Link>
        <Link href="https://www.facebook.com/whiteboardconsultants" className="text-primary-foreground/80 hover:text-primary-foreground dark:hover:text-white">
            <Facebook className="h-5 w-5" />
            <span className="sr-only">Facebook</span>
        </Link>
        <Link href="https://wa.me/+918583035656" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/80 hover:text-primary-foreground dark:hover:text-white">
            <WhatsAppIcon className="h-5 w-5" />
            <span className="sr-only">WhatsApp</span>
        </Link>
    </div>
  );
}
