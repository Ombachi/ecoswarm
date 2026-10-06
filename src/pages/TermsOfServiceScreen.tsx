import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, FileText, ShoppingBag } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";

const terms = [
  {
    title: "1. Acceptance of these terms",
    paragraphs: [
      "By accessing or using EcoSwarm, you agree to these Terms of Service and our Privacy Policy. If you do not agree, do not use the service.",
      "You must be legally able to enter into these terms. If you use EcoSwarm for an organisation, you confirm that you have authority to act for it.",
    ],
  },
  {
    title: "2. What EcoSwarm provides",
    paragraphs: ["EcoSwarm is a Kenyan education and sustainable-commerce platform. Its services include:"],
    items: [
      "Climate Academy courses, lessons, quizzes, progress tracking, and completion certificates.",
      "EcoMarket product discovery, seller information, product enquiries, orders, coupons, and M-Pesa payment support.",
      "Account, purchase, certificate, and support tools related to those services.",
    ],
  },
  {
    title: "3. Accounts and eligibility",
    paragraphs: [
      "You agree to provide accurate information, keep it current, protect your sign-in details, and promptly tell us if you suspect unauthorised account use.",
      "You are responsible for activity carried out through your account. We may request additional information where needed to prevent fraud, confirm a transaction, or meet a legal obligation.",
    ],
  },
  {
    title: "4. Climate Academy courses",
    paragraphs: [
      "Course descriptions, availability, length, assessments, and completion requirements may differ by course and may be updated to keep learning materials accurate.",
      "Your access is personal unless a course or organisation agreement states otherwise. You may not copy, resell, republish, scrape, or distribute course materials without written permission from the rights holder.",
    ],
  },
  {
    title: "5. Certificates",
    paragraphs: [
      "A certificate records completion of the stated EcoSwarm course requirements. It is not a university degree, professional licence, or guarantee of employment unless its course page expressly says otherwise.",
      "Certificates may include a public credential ID or verification link. We may correct, withdraw, or reissue a certificate that was created in error, obtained dishonestly, or altered after issue.",
    ],
  },
  {
    title: "6. EcoMarket products and sellers",
    paragraphs: [
      "Product pages should describe the item, price, seller, and available fulfilment information. Colours, packaging, and appearance may vary slightly from images.",
      "Unless a listing identifies EcoSwarm as the seller, the listed seller is responsible for product accuracy, quality, availability, lawful sale, and fulfilment. EcoSwarm provides the marketplace and may assist with communication or disputes.",
    ],
  },
  {
    title: "7. Prices, coupons, and M-Pesa payments",
    paragraphs: [
      "Prices are shown in Kenyan shillings (KSh). You pay the stated checkout amount unless a valid coupon is accepted before payment. Coupons may have dates, usage limits, eligible products, or other conditions and cannot be applied after expiry.",
      "M-Pesa is EcoSwarm's supported payment method. An order is confirmed only after payment verification. Never share your M-Pesa PIN with EcoSwarm, a seller, or anyone claiming to process an EcoSwarm order.",
      "If payment is delayed, duplicated, reversed, or unsuccessful, contact us with the order reference so it can be investigated.",
    ],
  },
  {
    title: "8. Delivery, cancellations, returns, and refunds",
    paragraphs: [
      "Delivery availability, cost, and timing depend on the product, destination, seller, and delivery provider. Any estimate is not a guaranteed arrival time unless expressly stated.",
      "Cancellation, return, replacement, and refund eligibility depends on the product, its condition, the seller's disclosed terms, and applicable Kenyan consumer law. Report missing, damaged, incorrect, or materially misdescribed goods promptly through the available support channel and keep relevant order evidence.",
      "Approved refunds are returned through an available method after review. M-Pesa and banking processing times may affect when funds appear.",
    ],
  },
  {
    title: "9. Acceptable use",
    paragraphs: ["You must not misuse EcoSwarm. In particular, you agree not to:"],
    items: [
      "Use false identities, payment details, delivery details, reviews, certificates, or course results.",
      "Interfere with security, access another person's account, introduce malicious code, scrape protected content, or disrupt the service.",
      "Upload or send unlawful, harmful, deceptive, infringing, discriminatory, or abusive material.",
      "Use EcoSwarm for fraud, unsolicited promotion, resale of unauthorised course content, or unlawful product sales.",
    ],
  },
  {
    title: "10. Intellectual property",
    paragraphs: [
      "EcoSwarm's name, branding, interface, and original materials are protected by applicable intellectual-property laws. Course creators and sellers retain rights in their original materials and product content.",
      "If you submit a rating, review, product listing, or other content, you confirm that you have the right to do so and grant EcoSwarm permission to host, display, reproduce, and format it for operating and promoting the relevant service.",
    ],
  },
  {
    title: "11. Suspension and termination",
    paragraphs: [
      "You may stop using EcoSwarm at any time. We may restrict, suspend, or close an account where reasonably necessary for security, fraud prevention, legal compliance, non-payment, repeated disputes, or a serious or repeated breach of these terms.",
      "Provisions concerning completed purchases, intellectual property, liability, disputes, and records required by law continue where appropriate after account closure.",
    ],
  },
  {
    title: "12. Availability and liability",
    paragraphs: [
      "We work to keep EcoSwarm accurate and available, but the service may occasionally be interrupted or contain errors. To the extent permitted by law, EcoSwarm is provided without guarantees beyond those expressly stated and rights that cannot lawfully be excluded.",
      "Nothing in these terms limits rights or liability that cannot be limited under applicable Kenyan law.",
    ],
  },
  {
    title: "13. Privacy and changes",
    paragraphs: [
      "Our Privacy Policy explains how we handle personal information. We may update these terms when the service, law, or operating requirements change. We will post the revised date and provide additional notice when a change materially affects users.",
    ],
  },
  {
    title: "14. Governing law and contact",
    paragraphs: [
      "These terms are governed by the laws of Kenya. We encourage you to contact us first so we can try to resolve a concern fairly and promptly.",
      "Questions about these terms can be sent to hello@ecoswarm.co.ke.",
    ],
  },
];

export function TermsOfServiceScreen() {
  const navigate = useNavigate();
  usePageMeta(
    "Terms of Service",
    "Read the terms governing EcoSwarm Climate Academy courses, certificates, EcoMarket purchases, delivery, and M-Pesa payments."
  );

  return (
    <PublicLayout>
      <header className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
          <Button variant="ghost" size="sm" className="mb-6 -ml-3 gap-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-primary">EcoSwarm legal</p>
              <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">Terms of Service</h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                The terms for learning through the Climate Academy and purchasing sustainable products through EcoMarket.
              </p>
              <p className="mt-3 text-sm text-muted-foreground">Last updated: 6 October 2026</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
            <BookOpen className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm font-medium text-foreground">Learn through courses and earn verifiable completion certificates.</p>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
            <ShoppingBag className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm font-medium text-foreground">Shop sustainable goods and pay securely through M-Pesa.</p>
          </div>
        </div>

        <article className="space-y-9">
          {terms.map((term) => (
            <section key={term.title} className="border-b border-border pb-9 last:border-0">
              <h2 className="mb-3 text-lg font-bold text-foreground sm:text-xl">{term.title}</h2>
              <div className="space-y-3 text-sm leading-7 text-muted-foreground sm:text-base">
                {term.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {term.items && (
                  <ul className="list-disc space-y-2 pl-5 marker:text-primary">
                    {term.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </article>

        <div className="mt-10 rounded-lg border border-primary/20 bg-primary/5 p-5 text-center">
          <p className="text-sm font-medium text-foreground">
            By using EcoSwarm, you acknowledge that you have read and understood these terms.
          </p>
          <Button variant="link" className="mt-1" onClick={() => navigate("/privacy-policy")}>
            Read the Privacy Policy
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}