
import { Footer } from "@/components/footer";
import { PublicHeader } from "@/components/public-header";
import type { Metadata } from "next";
import { URL } from "url";
import { DEFAULT_OG_IMAGE, metaDescription, pageTitle } from "@/lib/seo";

export const metadata: Metadata = {
  // IMPORTANT: Replace with your actual production domain
  metadataBase: new URL('https://www.whiteboardconsultant.com'), 
  title: {
    default: pageTitle('Study Abroad & Test Prep Experts in Kolkata'),
    template: '%s | Whiteboard Consultants',
  },
  description: metaDescription(
    "Expert guidance for studying abroad in top destinations (USA, UK, Canada, etc.) and comprehensive test preparation for IELTS, TOEFL, GMAT, GRE. Start your journey with the best education consultants in Kolkata."
  ),
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
    type: 'website',
    locale: 'en_IN',
    siteName: 'Whiteboard Consultants',
    title: pageTitle('Study Abroad & Test Prep Experts in Kolkata'),
    description: metaDescription(
      'Expert guidance for studying abroad and comprehensive test preparation. Unlock your potential with the best education consultants in Kolkata.'
    ),
    url: 'https://www.whiteboardconsultant.com',
    images: [
      {
        ...DEFAULT_OG_IMAGE,
        alt: 'Whiteboard Consultants - Study Abroad and Test Prep',
      },
    ],
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
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-64x64.png', sizes: '64x64', type: 'image/png' },
      { url: '/favicon-128x128.png', sizes: '128x128', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon-128x128.png', sizes: '128x128', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  verification: {
    google: 'b82vd6_2UJQUyMumAwaDxX_UuoK1Glq8CtQwgPdTilA',
  }
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
