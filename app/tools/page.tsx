"use client";

import { ToolCard } from "@/components/ToolCard";
import {
  Minimize2,
  Layers,
  Scissors,
  RefreshCw,
  Eraser,
  Stamp,
  ImageIcon,
  Wand2,
} from "lucide-react";


const allTools = [
  {
    icon: Minimize2,
    title: "Resize Image",
    description: "Change image dimensions while maintaining quality and aspect ratio.",
    href: "/resize-image",
    accent: "blue",
    category: "Quick Adjustments",
  },
  {
    icon: Layers,
    title: "Compress Image",
    description: "Reduce file size without losing visual quality.",
    href: "/compress-image",
    accent: "violet",
    category: "Quick Adjustments",
  },
  {
    icon: Scissors,
    title: "Crop Image",
    description: "Crop to any aspect ratio or custom dimensions.",
    href: "/crop-image",
    accent: "pink",
    category: "Quick Adjustments",
  },
  {
    icon: RefreshCw,
    title: "Convert Image",
    description: "Convert between PNG, JPG, WebP, AVIF, and GIF formats.",
    href: "/convert-image",
    accent: "cyan",
    category: "Quick Adjustments",
  },
  {
    icon: Eraser,
    title: "Remove Background",
    description: "Automatically remove image backgrounds in one click.",
    href: "/remove-background",
    accent: "emerald",
    category: "Advanced Editing",
  },
  {
    icon: Stamp,
    title: "Watermark Image",
    description: "Add text or logo watermarks to protect your images.",
    href: "/watermark-image",
    accent: "orange",
    category: "Advanced Editing",
  },
  {
    icon: ImageIcon,
    title: "Bulk Resizer",
    description: "Resize multiple images at once with a single setting.",
    href: "/bulk-resizer",
    accent: "rose",
    category: "Advanced Editing",
  },
  {
    icon: Wand2,
    title: "Image Editor",
    description: "Adjust brightness, contrast, saturation, blur, and more.",
    href: "/image-editor",
    accent: "amber",
    category: "Advanced Editing",
  },
];

const categories = Array.from(new Set(allTools.map((t) => t.category)));

export default function ToolsPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-6 pt-10 pb-8 border-b border-border bg-muted/20 dark:bg-white/1">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground mb-2">
            All Image Tools
          </h1>
          <p className="text-muted-foreground text-base max-w-xl">
            Free, fast, and privacy-first tools to process any image — no signup needed.
          </p>
        </div>
      </div>

      {/* Tool Categories */}
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        {categories.map((cat) => (
          <section key={cat}>
            <h2 className="text-xl font-bold text-foreground mb-5">{cat}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {allTools
                .filter((t) => t.category === cat)
                .map((tool) => (
                  <ToolCard key={tool.href} {...tool} />
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
