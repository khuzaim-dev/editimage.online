"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  accent?: string;
}

export function ToolCard({ icon: Icon, title, description, href, accent = "blue" }: ToolCardProps) {
  const accentMap: Record<string, string> = {
    blue: "text-blue-500 bg-blue-50 dark:bg-blue-500/10",
    violet: "text-violet-500 bg-violet-50 dark:bg-violet-500/10",
    pink: "text-pink-500 bg-pink-50 dark:bg-pink-500/10",
    emerald: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10",
    orange: "text-orange-500 bg-orange-50 dark:bg-orange-500/10",
    cyan: "text-cyan-500 bg-cyan-50 dark:bg-cyan-500/10",
    rose: "text-rose-500 bg-rose-50 dark:bg-rose-500/10",
    amber: "text-amber-500 bg-amber-50 dark:bg-amber-500/10",
  };
  const iconClass = accentMap[accent] ?? accentMap.blue;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group"
    >
      <Link href={href} className="block h-full">
        <div className="h-full flex flex-col gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg dark:hover:border-primary/20 dark:hover:shadow-primary/5 transition-all duration-300">
          <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", iconClass)}>
            <Icon size={22} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground mb-1.5">{title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Try now <ArrowRight size={12} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
