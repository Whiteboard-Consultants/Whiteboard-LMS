
import Link from 'next/link';
import Image from 'next/image';
import { SocialLinks } from './social-links';

export function Footer() {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="bg-primary text-primary-foreground dark:bg-black dark:border-t dark:border-primary-foreground/20">
            <div className="container py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1 space-y-4">
                         <Link href="/" className="flex items-center space-x-2">
                             <Image src="/logo.png" alt="Whiteboard Consultants Logo" width={200} height={40} style={{ height: 'auto', width: 'auto' }} />
                         </Link>
                         <p className="text-sm text-primary-foreground/80">
                           Your trusted partner for global education and career development.
                         </p>
                         <SocialLinks />
                    </div>
                     <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="font-semibold mb-4">Study Abroad</h3>
                            <ul className="space-y-2 text-sm text-primary-foreground/80">
                                <li><Link href="/study-abroad/ireland" className="hover:underline">Ireland</Link></li>
                                <li><Link href="/study-abroad/uk" className="hover:underline">United Kingdom</Link></li>
                                <li><Link href="/study-abroad/germany" className="hover:underline">Germany</Link></li>
                                <li><Link href="/study-abroad/usa" className="hover:underline">USA</Link></li>
                                <li><Link href="/study-abroad/canada" className="hover:underline">Canada</Link></li>
                                <li><Link href="/study-abroad/australia" className="hover:underline">Australia</Link></li>
                                <li><Link href="/study-abroad/dubai" className="hover:underline">Dubai (UAE)</Link></li>
                                <li><Link href="/study-abroad/new-zealand" className="hover:underline">New Zealand</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Admissions</h3>
                            <ul className="space-y-2 text-sm text-primary-foreground/80">
                                <li><Link href="/college-admissions" className="hover:underline">Indian Colleges</Link></li>
                                <li><Link href="/admissions/uow-india" className="hover:underline">UOW India</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Services</h3>
                            <ul className="space-y-2 text-sm text-primary-foreground/80">
                                <li><Link href="/courses" className="hover:underline">Test Preparation</Link></li>
                                <li><Link href="/courses" className="hover:underline">Career Development</Link></li>
                                <li><Link href="/courses" className="hover:underline">Language Skills</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Company</h3>
                            <ul className="space-y-2 text-sm text-primary-foreground/80">
                                <li><Link href="/about" className="hover:underline">About Us</Link></li>
                                <li><Link href="/contact" className="hover:underline">Contact Us</Link></li>
                                <li><Link href="/blog" className="hover:underline">Blog</Link></li>
                                <li><Link href="#" className="hover:underline">Privacy Policy</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="mt-8 border-t border-primary-foreground/20 pt-8 text-center text-sm text-primary-foreground/80">
                    &copy; {currentYear} Whiteboard Consultants. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
