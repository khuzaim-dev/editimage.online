"use client";

import { motion } from "motion/react";
import { Star } from "lucide-react";
import { ReactNode } from "react";

interface SplitHeroLayoutProps {
  badge?: string;
  rating?: { score: string; count: string };
  headline: ReactNode;
  description: string;
  uploadArea: ReactNode;
  trustBadges?: { icon: ReactNode; label: string }[];
  visual: ReactNode;
}

export function SplitHeroLayout({
  badge,
  rating,
  headline,
  description,
  uploadArea,
  trustBadges,
  visual,
}: SplitHeroLayoutProps) {
  return (
    <section className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 px-6 py-12 lg:py-20 max-w-7xl mx-auto w-full">
      {/* Left Column */}
      <motion.div
        className="flex-1 flex flex-col gap-6 max-w-xl"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Rating */}
        {rating && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className="fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-foreground">
              Rated {rating.score} out of 5
            </span>
            <span className="text-sm text-muted-foreground">
              (Based on {rating.count} reviews)
            </span>
          </div>
        )}

        {/* Headline */}
        <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-foreground">
          {headline}
        </h1>

        {/* Description */}
        <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>

        {/* Upload / Action Area */}
        <div>{uploadArea}</div>

        {/* Trust Badges */}
        {trustBadges && (
          <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground pt-2">
            {trustBadges.map((b, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {b.icon}
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Right Column - Visual */}
      <motion.div
        className="flex-1 flex items-center justify-center w-full max-w-lg lg:max-w-none"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
      >
        {visual}
      </motion.div>
    </section>
  );
}
