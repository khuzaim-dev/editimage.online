import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Tag, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — Image Optimization Tips & Guides",
  description:
    "Expert guides on image compression, formats, background removal, and optimization techniques for the web.",
};

const posts = [
  {
    slug: "compress-images-without-losing-quality",
    title: "How to Compress Images Without Losing Quality",
    description:
      "Learn the best techniques to shrink image file sizes while keeping them crisp and professional. We cover JPEG, PNG, and WebP strategies.",
    tag: "Compression",
    date: "Jun 15, 2025",
    readTime: "5 min read",
  },
  {
    slug: "best-image-formats-for-web",
    title: "Best Image Formats for the Web in 2025",
    description:
      "A deep dive into WebP, AVIF, PNG, and JPEG — understanding when to use each for maximum web performance.",
    tag: "Formats",
    date: "May 28, 2025",
    readTime: "7 min read",
  },
  {
    slug: "how-to-remove-background-online",
    title: "How to Remove Image Background Online for Free",
    description:
      "Step-by-step guide to removing backgrounds from product photos, portraits, and logos — no Photoshop needed.",
    tag: "Background Removal",
    date: "May 10, 2025",
    readTime: "4 min read",
  },
  {
    slug: "resize-images-for-social-media",
    title: "The Ultimate Guide to Resizing Images for Social Media",
    description:
      "Exact dimensions for Instagram, Twitter, LinkedIn, and more. Ensure your images always look perfect on every platform.",
    tag: "Resize",
    date: "Apr 22, 2025",
    readTime: "6 min read",
  },
  {
    slug: "what-is-webp",
    title: "What Is WebP and Why Should You Use It?",
    description:
      "WebP offers 25-35% smaller files than JPEG with better quality. Learn how to convert your images today.",
    tag: "Formats",
    date: "Apr 5, 2025",
    readTime: "5 min read",
  },
  {
    slug: "watermarking-photos",
    title: "How to Watermark Your Photos to Protect Copyright",
    description:
      "A practical guide to adding professional text and logo watermarks to protect your photography and artwork.",
    tag: "Watermark",
    date: "Mar 18, 2025",
    readTime: "4 min read",
  },
];

const tagColors: Record<string, string> = {
  Compression: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  Formats: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
  "Background Removal": "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  Resize: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400",
  Watermark: "bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-6 pt-10 pb-8 border-b border-border bg-muted/20 dark:bg-white/1">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground mb-2">
            Blog & Guides
          </h1>
          <p className="text-muted-foreground text-base max-w-xl">
            Practical image optimization tips, format guides, and tutorials from the editimage.online team.
          </p>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog`}
              className="group flex flex-col gap-4 p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg dark:hover:shadow-primary/5 transition-all duration-300"
            >
              {/* Tag */}
              <span
                className={`self-start text-xs font-semibold px-2.5 py-1 rounded-full ${
                  tagColors[post.tag] ?? "bg-muted text-muted-foreground"
                }`}
              >
                {post.tag}
              </span>

              {/* Title */}
              <h2 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                {post.title}
              </h2>

              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                {post.description}
              </p>

              {/* Meta + CTA */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} /> {post.date}
                  </span>
                  <span>{post.readTime}</span>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Read <ArrowRight size={11} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
