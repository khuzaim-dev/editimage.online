"use client";

import { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items?: FAQItem[];
}

const DEFAULT_FAQS: FAQItem[] = [
  {
    question: "How does this tool work?",
    answer:
      "Simply upload your image, configure the settings, and click the Process button. Your image will be processed and ready to download instantly.",
  },
  {
    question: "Is it free to use?",
    answer:
      "Yes! All core tools on editimage.online are completely free to use. No signup or credit card required.",
  },
  {
    question: "Is my image safe and private?",
    answer:
      "Absolutely. Your images are processed securely and are never shared with third parties. Files are automatically deleted from our servers after processing.",
  },
  {
    question: "Will the image quality be reduced?",
    answer:
      "Our tools are designed to preserve image quality as much as possible. For lossy operations like compression, you have full control over the quality settings.",
  },
];

export function FAQAccordion({ items = DEFAULT_FAQS }: FAQAccordionProps) {
  return (
    <section className="w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-2">
        Frequently Asked Questions
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-8">
        Everything you need to know about this tool.
      </p>
      <Accordion multiple={false} className="w-full space-y-3">
        {items.map((item, i) => (
          <AccordionItem
            key={i}
            value={`faq-${i}`}
            className="border border-border rounded-xl px-5 py-1 bg-card shadow-sm"
          >
            <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
