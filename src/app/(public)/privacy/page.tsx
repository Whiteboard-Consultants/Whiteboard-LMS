import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy | Whiteboard Consultants',
  description:
    'Learn how Whiteboard Consultants collects, uses, and protects your personal information. Comprehensive privacy policy for our educational services and online courses.',
  path: '/privacy',
  keywords: 'privacy policy, data protection, personal information, GDPR, data security',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    description: 'Learn how Whiteboard Consultants collects, uses, and protects your personal information.',
  },
});

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 md:py-16">
        {/* Back Button */}
        <div className="mb-8">
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground">
            <strong>Effective Date:</strong> November 18, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-4xl">
          {/* Introduction */}
          <section className="mb-12">
            <p className="text-base leading-relaxed text-foreground">
              Welcome to <strong>Whiteboard Consultants</strong> ("we", "us", "our"). This Privacy Policy explains how we 
              collect, use, disclose, and safeguard your personal information when you use our website or 
              enroll in our online courses—including cross-border offerings in India, Nepal, Bangladesh, 
              UAE, Sri Lanka, and beyond.
            </p>
          </section>

          {/* Section 1: Information We Collect */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">1. Information We Collect</h2>
            
            <div className="space-y-6">
              {/* Personal Data */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Personal Data</h3>
                <ul className="list-disc pl-6 space-y-2 text-foreground">
                  <li><strong>Name, email, phone, address, birthdate</strong> - for account creation and communication</li>
                  <li><strong>Credentials, uploaded documents, payment info</strong> - processed securely, not stored</li>
                  <li><strong>Country of residence, academic and professional details</strong> - for course recommendations</li>
                </ul>
              </div>

              {/* Device & Usage Data */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Device & Usage Data</h3>
                <ul className="list-disc pl-6 space-y-2 text-foreground">
                  <li><strong>Device type, browser info, IP address</strong> - for security and optimization</li>
                  <li><strong>Pages viewed, visits, user actions, session duration, interactions</strong> - to improve experience</li>
                </ul>
              </div>

              {/* Third-Party Tools & Tracking */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Third-Party Tools & Tracking Technologies</h3>
                <div className="space-y-2 text-foreground">
                  <p className="font-semibold">The following services collect data on our behalf:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Google Analytics</strong> - collects anonymized data on visit duration, navigation, behavioral patterns</li>
                    <li><strong>Meta Pixel, Google reCAPTCHA</strong> - collect data on device, visit duration, navigation, behavioral identifiers, and technical information for analytics, advertising, and security</li>
                    <li><strong>Cookies, trackers, and pixels</strong> - record browsing habits and preferences</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: How We Use Your Data */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">2. How We Use Your Data</h2>
            <ul className="list-disc pl-6 space-y-2 text-foreground">
              <li><strong>Account creation and management</strong></li>
              <li><strong>Delivering courses and educational services</strong></li>
              <li><strong>Payment, enrollment, and fulfillment processing</strong></li>
              <li><strong>Informing you of updates, confirmations, recommendations, offers</strong></li>
              <li><strong>Improving website, user experience, and offerings</strong></li>
              <li><strong>Analytics (with Google Analytics, Meta Pixel)</strong> and advertising performance measurement</li>
              <li><strong>Fraud protection and site security</strong> (via Enterprise reCAPTCHA)</li>
              <li><strong>Marketing, promotions, feedback (opt-in available)</strong></li>
              <li><strong>Legal compliance and dispute resolution</strong></li>
            </ul>
          </section>

          {/* Section 3: Sharing & Disclosure */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">3. Sharing & Disclosure</h2>
            <p className="text-foreground mb-4">We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-2 text-foreground">
              <li><strong>Service providers</strong> (payment processors, email platforms, hosting providers, analytics tools)</li>
              <li><strong>University partners</strong> (e.g., University of Wollongong) for admissions and course delivery</li>
              <li><strong>Legal authorities</strong> when required by law or to protect rights and safety</li>
              <li><strong>Business transfers</strong> - in case of merger, acquisition, or bankruptcy</li>
            </ul>
            <p className="text-foreground mt-4">
              <strong>We do not sell your personal data</strong> to third parties for marketing purposes.
            </p>
          </section>

          {/* Section 4: Data Retention */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">4. Data Retention</h2>
            <p className="text-foreground">
              We retain your personal data for as long as necessary to provide services, comply with legal obligations, 
              and resolve disputes. You may request deletion of your data at any time, subject to legal requirements.
            </p>
          </section>

          {/* Section 5: Data Security */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">5. Data Security</h2>
            <p className="text-foreground">
              We implement industry-standard security measures including encryption, secure servers, and access controls 
              to protect your personal information. However, no online transmission is 100% secure. We are not responsible 
              for unauthorized access due to circumstances beyond our control.
            </p>
          </section>

          {/* Section 6: Your Rights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">6. Your Rights</h2>
            <p className="text-foreground mb-4">Depending on your location, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-foreground">
              <li><strong>Access</strong> your personal data</li>
              <li><strong>Correct</strong> inaccurate information</li>
              <li><strong>Delete</strong> your data (with exceptions)</li>
              <li><strong>Restrict</strong> processing of your data</li>
              <li><strong>Data portability</strong> - request your data in a portable format</li>
              <li><strong>Opt-out</strong> of marketing communications and tracking</li>
            </ul>
            <p className="text-foreground mt-4">
              To exercise these rights, contact us at <strong>info@whiteboardconsultant.com</strong>.
            </p>
          </section>

          {/* Section 7: International Data Transfers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">7. International Data Transfers</h2>
            <p className="text-foreground">
              Since we serve students across India, Nepal, Bangladesh, UAE, Sri Lanka, and beyond, your data may be 
              transferred, stored, and processed in different jurisdictions. By using our services, you consent to such 
              transfers. We implement safeguards to protect your data during international transfers.
            </p>
          </section>

          {/* Section 8: GDPR & Privacy Laws */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">8. GDPR & Privacy Laws</h2>
            <p className="text-foreground">
              For EU residents, we comply with the General Data Protection Regulation (GDPR). For California residents, 
              we comply with the California Consumer Privacy Act (CCPA). For India-based users, we comply with relevant 
              data protection regulations.
            </p>
          </section>

          {/* Section 9: Cookies & Tracking */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">9. Cookies & Tracking</h2>
            <p className="text-foreground mb-4">
              We use cookies, web beacons, and similar tracking technologies to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground">
              <li>Remember your preferences</li>
              <li>Understand how you interact with our site</li>
              <li>Deliver targeted advertising</li>
              <li>Prevent fraud</li>
            </ul>
            <p className="text-foreground mt-4">
              You can control cookies through your browser settings. Disabling cookies may affect site functionality.
            </p>
          </section>

          {/* Section 10: Third-Party Links */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">10. Third-Party Links</h2>
            <p className="text-foreground">
              Our website may contain links to third-party websites. We are not responsible for their privacy practices. 
              Please review their privacy policies before providing personal information.
            </p>
          </section>

          {/* Section 11: Children's Privacy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">11. Children's Privacy</h2>
            <p className="text-foreground">
              Our services are not directed to children under 13. We do not knowingly collect information from children 
              without parental consent. If we discover we have collected data from a child without consent, we will 
              delete it immediately.
            </p>
          </section>

          {/* Section 12: Changes to This Policy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">12. Changes to This Policy</h2>
            <p className="text-foreground">
              We may update this Privacy Policy periodically. Material changes will be notified via email or prominent 
              notice on our website. Continued use of our services constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Section 13: Contact Us */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">13. Contact Us</h2>
            <p className="text-foreground mb-4">
              If you have questions or concerns about this Privacy Policy or our data practices, contact us at:
            </p>
            <div className="bg-muted p-6 rounded-lg space-y-2 text-foreground">
              <p>
                <strong>Whiteboard Consultants</strong><br />
                'My Cube', 6th Floor, Park Plaza, 71, Park Street<br />
                Kolkata, West Bengal 700016, India
              </p>
              <p>
                <strong>Email:</strong>{' '}
                <Link href="mailto:info@whiteboardconsultant.com" className="text-primary hover:underline">
                  info@whiteboardconsultant.com
                </Link>
              </p>
              <p>
                <strong>Phone:</strong>{' '}
                <Link href="tel:+918583035656" className="text-primary hover:underline">
                  +91-85830-35656
                </Link>
              </p>
            </div>
          </section>

          {/* Data Processing Agreement Notice */}
          <section className="mb-12">
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-blue-950 dark:text-blue-100">Data Processing Notice</h3>
              <p className="text-sm text-blue-900 dark:text-blue-200">
                By using Whiteboard Consultants, you explicitly consent to our collection, use, and processing of your 
                personal information as described in this Privacy Policy. Your privacy is important to us, and we are 
                committed to transparent data practices and compliance with applicable privacy laws.
              </p>
            </div>
          </section>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 pt-8 border-t">
          <Button asChild>
            <Link href="/contact">
              Have More Questions? Contact Us
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
