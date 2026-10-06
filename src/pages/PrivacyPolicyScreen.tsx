import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Database,
  Eye,
  GraduationCap,
  Lock,
  Mail,
  ReceiptText,
  Shield,
  ShoppingBag,
  UserCheck,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";

const sections = [
  {
    icon: Database,
    title: "Information we collect",
    intro: "We collect the information needed to provide the Climate Academy and EcoMarket, including:",
    items: [
      "Account and profile details, such as your name, email address, phone number, county, profile photo, and information you choose to add.",
      "Learning records, including course enrolment, lesson progress, quiz results, completion dates, and certificate credentials.",
      "Marketplace records, including products ordered, quantities, coupon use, delivery details, order status, and payment status.",
      "M-Pesa transaction references and confirmation status supplied by our payment provider. EcoSwarm does not collect or store your M-Pesa PIN.",
      "Messages you send to sellers or EcoSwarm support and product ratings you choose to submit.",
      "Basic device, browser, diagnostic, and usage information required to operate, secure, and improve the service.",
    ],
  },
  {
    icon: Eye,
    title: "How we use your information",
    intro: "We use this information to:",
    items: [
      "Create and secure your account and provide the features you request.",
      "Save your learning progress, confirm course completion, and issue verifiable certificates in your name.",
      "Process EcoMarket orders, validate coupons, confirm M-Pesa payments, coordinate delivery, and provide purchase support.",
      "Connect buyers and sellers where needed to fulfil an order or answer a product enquiry.",
      "Send essential account, course, certificate, order, payment, delivery, and security notices.",
      "Prevent fraud, troubleshoot problems, understand service performance, and improve EcoSwarm.",
      "Meet legal, tax, accounting, consumer-protection, and regulatory obligations.",
    ],
    note: "We do not sell your personal information.",
  },
  {
    icon: GraduationCap,
    title: "Learning and certificates",
    intro: "Your learning record allows EcoSwarm to restore progress across devices and recognise completed work.",
    items: [
      "Certificates may display your full name, course title, completion date, credential ID, issuing organisation, and a verification code.",
      "Anyone with a valid certificate link or credential ID may confirm the certificate details shown on the verification page.",
      "Course creators and authorised administrators may access learning information needed to deliver courses and support learners.",
    ],
  },
  {
    icon: ShoppingBag,
    title: "Orders, delivery, and M-Pesa",
    intro: "When you buy from EcoMarket, we use your order information only as needed to complete and support the purchase.",
    items: [
      "Your phone number is used to initiate or confirm an M-Pesa payment and to communicate about the order.",
      "Your name, delivery address, and contact details may be shared with the relevant seller or delivery provider to fulfil your order.",
      "M-Pesa and delivery providers process information under their own privacy terms. We receive only the information needed to confirm and reconcile the transaction.",
    ],
  },
  {
    icon: Lock,
    title: "How we protect information",
    intro: "We use technical and organisational safeguards appropriate to the information we handle.",
    items: [
      "Information is encrypted while being transmitted.",
      "Passwords are protected by our authentication provider and are not stored by EcoSwarm in readable form.",
      "Access controls limit personal and commercial records to authorised people and services.",
      "We monitor and review the platform for reliability and security issues.",
    ],
    note: "No online service can guarantee absolute security. Use a strong password and keep your sign-in details private.",
  },
  {
    icon: UserCheck,
    title: "Your choices and rights",
    intro: "Subject to applicable law, you may:",
    items: [
      "Ask for access to or a copy of your personal information.",
      "Correct inaccurate profile or account information.",
      "Request deletion of your account and information that we are not legally required to retain.",
      "Ask for portable information in a commonly used format where available.",
      "Manage optional communications and device notification permissions.",
      "Raise a concern about how your information is handled.",
    ],
  },
  {
    icon: ReceiptText,
    title: "How long we keep information",
    intro: "We keep information only for as long as it is needed for the purposes described here:",
    items: [
      "Account and profile information is normally retained while your account is active.",
      "Course progress and certificate records are retained to provide your learning history and preserve certificate verification, unless deletion is required and legally permitted.",
      "Order, M-Pesa confirmation, coupon, refund, and delivery records may be retained after account closure where required for tax, accounting, fraud prevention, disputes, and consumer-protection obligations.",
      "Support and diagnostic records are retained only as long as reasonably needed to resolve issues, protect the service, and improve reliability.",
    ],
    note: "When information is no longer required, we delete it or remove identifying details where reasonably possible.",
  },
  {
    icon: Mail,
    title: "Contact us",
    intro: "For privacy questions or requests, contact EcoSwarm at hello@ecoswarm.co.ke. We may need to verify your identity before completing a request.",
    items: [],
  },
];

export function PrivacyPolicyScreen() {
  const navigate = useNavigate();
  usePageMeta(
    "Privacy Policy",
    "Learn how EcoSwarm handles account, learning, certificate, EcoMarket, delivery, and M-Pesa transaction information."
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
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-primary">EcoSwarm legal</p>
              <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">Privacy Policy</h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                How we collect, use, protect, and retain information across the Climate Academy and EcoMarket.
              </p>
              <p className="mt-3 text-sm text-muted-foreground">Last updated: 6 October 2026</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-10 border-l-4 border-primary pl-5">
          <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
            <BookOpen className="h-5 w-5 text-primary" />
            Privacy in plain language
          </div>
          <p className="text-sm leading-7 text-muted-foreground sm:text-base">
            EcoSwarm uses your information to help you learn, receive certificates, buy sustainable products, and manage your orders. We collect only what is reasonably needed for those services and our legal obligations.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {sections.map((section) => (
            <section key={section.title} className="rounded-lg border border-border bg-card p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{section.intro}</p>
              {section.items.length > 0 && (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground marker:text-primary">
                  {section.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
              {section.note && <p className="mt-4 text-sm font-medium leading-6 text-foreground">{section.note}</p>}
            </section>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}