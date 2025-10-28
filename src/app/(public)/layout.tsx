
import { Footer } from "@/components/footer";
import { PublicHeader } from "@/components/public-header";
import type { Metadata } from "next";
import { URL } from "url";

export const metadata: Metadata = {
  // IMPORTANT: Replace with your actual production domain
  metadataBase: new URL('https://whiteboard-consultants-mock.com'), 
  title: {
    default: 'Whiteboard Consultants - Study Abroad & Test Prep Experts in Kolkata',
    template: '%s | Whiteboard Consultants',
  },
  description: "Expert guidance for studying abroad in top destinations (USA, UK, Canada, etc.) and comprehensive test preparation for IELTS, TOEFL, GMAT, GRE. Start your journey with the best education consultants in Kolkata.",
  keywords: [
    "study abroad consultants Kolkata",
    "overseas education consultants",
    "IELTS coaching Kolkata",
    "GMAT preparation India",
    "best education consultants in Kolkata",
    "study in USA",
    "study in Canada",
    "study in UK",
    "study in Australia",
    "higher education abroad",
  ],
  openGraph: {
    title: 'Whiteboard Consultants - Your Gateway to Global Education',
    description: 'Expert guidance for studying abroad and comprehensive test preparation. Unlock your potential with the best education consultants in Kolkata.',
    url: '/',
    siteName: 'Whiteboard Consultants',
    images: [
      {
        url: '/og-image.png', // TODO: Create this image (1200x630)
        width: 1200,
        height: 630,
        alt: 'Whiteboard Consultants - Study Abroad and Test Prep',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  // TODO: Add your Google Search Console verification code
  // verification: {
  //   google: 'your-google-verification-code',
  // }
};

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <PublicHeader />
            <main>{children}</main>
            <Footer />
        </div>
    )
}
