"use client";

import { ReactNode } from "react";
import { motion } from "motion/react";
import { ToolCard } from "@/components/ToolCard";
import { FAQAccordion, FAQItem } from "@/components/FAQAccordion";
import { Download } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RelatedTool {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  accent?: string;
}

interface ToolPageTemplateProps {
  title: string;
  description: string;
  uploadArea: ReactNode;
  settingsPanel?: ReactNode;
  previewSection?: ReactNode;
  faqs?: FAQItem[];
  relatedTools?: RelatedTool[];
  badge?: string;
}

export function ToolPageTemplate({
  title,
  description,
  uploadArea,
  settingsPanel,
  previewSection,
  faqs,
  relatedTools,
  badge,
}: ToolPageTemplateProps) {
  return (
    <div className="min-h-screen">
      {/* ── Header ── */}
      <div className="px-6 pt-10 pb-6 border-b border-border bg-muted/20 dark:bg-white/1">
        <div className="max-w-7xl mx-auto">
          {badge && (
            <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full brand-gradient text-white mb-4">
              {badge}
            </span>
          )}
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground mb-3">
            {title}
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* ── Main Tool Area ── */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left: Upload + Settings */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {uploadArea}
            </motion.div>

            {settingsPanel && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                {settingsPanel}
              </motion.div>
            )}


          </div>

          {/* Right: Preview — sticky so it stays visible while user scrolls settings */}
          <div className="lg:col-span-3 lg:sticky lg:top-[72px] lg:self-start">
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              {previewSection ?? (
                <div className="h-full min-h-[400px] rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-muted/20 dark:bg-white/2">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-muted dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                      <Download size={24} className="text-muted-foreground" />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">Preview appears here</p>
                    <p className="text-xs text-muted-foreground">Upload and process an image to see the result</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <section className="px-6 py-14 bg-muted/20 dark:bg-white/1 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <FAQAccordion items={faqs} />
        </div>
      </section>

      {/* ── Related Tools ── */}
      {relatedTools && relatedTools.length > 0 && (
        <section className="px-6 py-14 border-t border-border">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2 text-center">Related Tools</h2>
            <p className="text-sm text-muted-foreground text-center mb-8">
              More tools to supercharge your image workflow.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedTools.map((tool) => (
                <ToolCard key={tool.href} {...tool} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
