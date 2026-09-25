import { HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "How do the climate courses work?",
    a: "Each course in the Climate Academy is made of short sections you can read at your own pace, followed by a short quiz. Score 70% or above and you unlock a shareable EcoSwarm certificate with a verification link.",
  },
  {
    q: "Do I need to pay for courses?",
    a: "Courses in the Climate Academy are free for every EcoWarrior. All you need is an account.Create one in under a minute and start learning immediately.",
  },
  {
    q: "How do I buy a product from EcoMarket?",
    a: "Open the product, tap Buy, and confirm the M-Pesa prompt on your phone. Payment is handled securely through M-Pesa. You will get an in-app confirmation and your order appears under Purchases.",
  },
  {
    q: "Do you accept coupons or discounts?",
    a: "Yes. On special days such as World Environment Day we issue coupon codes. Enter the code at checkout and the discount is applied to your total before the M-Pesa request is sent.",
  },
  {
    q: "How is delivery or shipping handled?",
    a: "Sellers arrange delivery directly with you. After a successful payment you can message the seller in your inbox to confirm your location, delivery timeline and any pickup option they offer.",
  },
  {
    q: "What is your refund policy?",
    a: "If an item is not delivered, is damaged, or is materially different from its listing, raise a dispute from your Purchases screen within 7 days. Our team reviews the case and, where it is upheld, the payment is reversed to your M-Pesa number before the seller payout is released.",
  },
];

export function LandingFAQ() {
  return (
    <section id="faq" className="py-14 md:py-20 bg-muted/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-12">
          <span className="eco-badge mb-4 inline-flex">
            <HelpCircle className="w-3.5 h-3.5" />
          </span>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">Frequently asked questions</h2>
          <p className="text-muted-foreground mt-3 md:text-lg">Courses, payments, delivery and refunds.</p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
