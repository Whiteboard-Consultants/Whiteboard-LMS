import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund Policy | Whiteboard Consultants',
  description: 'Learn about our transparent refund policy. Get details on refund eligibility, valid reasons, exclusions, and how to request a refund for our online courses.',
  keywords: 'refund policy, money-back guarantee, course refund, refund conditions',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    url: '/refund-policy',
    title: 'Refund Policy | Whiteboard Consultants',
    description: 'Learn about our transparent refund policy for online courses.',
  },
};

export default function RefundPolicyPage() {
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
          <h1 className="text-4xl font-bold tracking-tight mb-4">Refund Policy</h1>
          <p className="text-lg text-muted-foreground">
            <strong>Effective Date:</strong> November 18, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-4xl">
          {/* Introduction */}
          <section className="mb-12">
            <p className="text-base leading-relaxed text-foreground">
              At <strong>Whiteboard Consultants</strong>, we strive to deliver the highest quality online programs and 
              customer experience. If you are unsatisfied with your purchase, we offer a transparent refund policy 
              that ensures fairness and protection for both our students and our organization.
            </p>
          </section>

          {/* Section 1: Refund Eligibility */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">1. Refund Eligibility</h2>
            <ul className="list-disc pl-6 space-y-3 text-foreground">
              <li>
                <strong>14-Day Refund Window</strong> - You may request a refund within <strong>14 days</strong> of your course purchase date.
              </li>
              <li>
                <strong>Content Access Limit</strong> - You must not have accessed more than <strong>20% of the course content or completed more than one module</strong>.
              </li>
              <li>
                <strong>Refund Request Process</strong> - To initiate a refund, email us at{' '}
                <Link href="mailto:info@whiteboardconsultant.com" className="text-primary hover:underline font-medium">
                  info@whiteboardconsultant.com
                </Link>
                {' '}with your full name, course details, purchase date, and reason for your request.
              </li>
            </ul>
          </section>

          {/* Section 2: Valid Reasons for Refund */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">2. Valid Reasons for Refund</h2>
            <p className="text-foreground mb-4">Refunds may be issued for:</p>
            <ul className="list-disc pl-6 space-y-3 text-foreground">
              <li>
                <strong>Technical Issues</strong> - Technical issues that prevent you from accessing the course, which our team is unable to resolve.
              </li>
              <li>
                <strong>Course Content Discrepancies</strong> - Significant discrepancies between the course description and the content delivered.
              </li>
              <li>
                <strong>Non-Delivery of Promised Services</strong> - Non-delivery of promised course materials or services.
              </li>
            </ul>
          </section>

          {/* Section 3: Exclusions */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">3. Exclusions</h2>
            <p className="text-foreground mb-4">No refunds will be provided in the following situations:</p>
            <ul className="list-disc pl-6 space-y-3 text-foreground">
              <li>
                <strong>Excessive Content Access</strong> - If more than 20% of the course content has been accessed, or if more than one module has been completed.
              </li>
              <li>
                <strong>Substantial Resource Access</strong> - If downloadable resources have been substantially accessed.
              </li>
              <li>
                <strong>Refund Window Expired</strong> - If a refund request is made after the 14-day window.
              </li>
              <li>
                <strong>Policy Abuse Suspected</strong> - If abuse of the refund policy is suspected (such as multiple refund requests from the same user).
              </li>
              <li>
                <strong>Change of Mind</strong> - For change of mind after beginning substantial course content.
              </li>
            </ul>
          </section>

          {/* Section 4: Refund Processing */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">4. Refund Processing</h2>
            <ul className="list-disc pl-6 space-y-3 text-foreground">
              <li>
                <strong>Review Time</strong> - All refund requests will be reviewed within <strong>5-7 business days</strong> of receipt.
              </li>
              <li>
                <strong>Processing Time</strong> - Once approved, refunds will be processed to the original payment method within <strong>7-14 business days</strong>.
              </li>
              <li>
                <strong>Communication</strong> - You will receive an email confirmation when your refund is approved or denied, with detailed reasons if applicable.
              </li>
              <li>
                <strong>Course Access Revocation</strong> - Upon refund approval, your access to the course will be immediately revoked.
              </li>
            </ul>
          </section>

          {/* Section 5: Partial Refunds */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">5. Partial Refunds</h2>
            <p className="text-foreground">
              Whiteboard Consultants reserves the right to issue partial refunds in cases where students have accessed 
              between 15-20% of course content, at our discretion. In such cases, the refund amount will be reduced proportionally 
              to the extent of content accessed.
            </p>
          </section>

          {/* Section 6: Non-Refundable Items */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">6. Non-Refundable Items</h2>
            <p className="text-foreground mb-4">The following are non-refundable:</p>
            <ul className="list-disc pl-6 space-y-3 text-foreground">
              <li><strong>Certificates</strong> - Once issued, certificates cannot be refunded.</li>
              <li><strong>Completed Coursework</strong> - Any completed assessments or coursework.</li>
              <li><strong>Downloadable Materials</strong> - Downloadable course materials that have been accessed.</li>
              <li><strong>Promotional Discounts</strong> - Courses purchased with promotional codes or discounts.</li>
            </ul>
          </section>

          {/* Section 7: Special Circumstances */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">7. Special Circumstances</h2>
            <p className="text-foreground">
              Whiteboard Consultants may consider refunds outside this policy for special circumstances such as 
              serious illness, family emergencies, or other unforeseen hardships. Such requests will be evaluated 
              on a case-by-case basis at our discretion. Please contact us with detailed information and supporting 
              documentation.
            </p>
          </section>

          {/* Section 8: Payment Method Considerations */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">8. Payment Method Considerations</h2>
            <ul className="list-disc pl-6 space-y-3 text-foreground">
              <li>
                <strong>Original Payment Method</strong> - Refunds are issued to the original payment method used for purchase.
              </li>
              <li>
                <strong>Credit Card Chargebacks</strong> - If you initiate a chargeback with your credit card provider without 
                first requesting a refund through us, we may dispute the chargeback. This may result in account suspension.
              </li>
              <li>
                <strong>International Payments</strong> - International refunds may take longer due to banking processes (14-21 business days).
              </li>
            </ul>
          </section>

          {/* Section 9: Contact Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">9. Contact Information</h2>
            <p className="text-foreground mb-4">
              For refund inquiries or to initiate a refund request, please contact us:
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
              <p>
                <strong>Response Time:</strong> We aim to respond to all refund inquiries within 24-48 business hours.
              </p>
            </div>
          </section>

          {/* Section 10: Policy Changes */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">10. Policy Changes</h2>
            <p className="text-foreground">
              Whiteboard Consultants reserves the right to modify this Refund Policy at any time. Changes will be 
              communicated via email or prominent notice on our website. Refund requests submitted before the policy 
              change date will be processed under the original policy.
            </p>
          </section>

          {/* Legal Notice */}
          <section className="mb-12">
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-blue-950 dark:text-blue-100">Important Notice</h3>
              <p className="text-sm text-blue-900 dark:text-blue-200">
                This Refund Policy is designed to be fair, transparent, and compliant with consumer protection laws 
                in India and internationally. By enrolling in our courses, you acknowledge that you have read, understood, 
                and agree to this Refund Policy. For questions or disputes, please contact us directly before pursuing 
                external remedies.
              </p>
            </div>
          </section>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 pt-8 border-t space-y-4">
          <p className="text-foreground">
            Have questions about our refund policy? We're here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild>
              <Link href="mailto:info@whiteboardconsultant.com">
                Email Us
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
