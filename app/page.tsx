"use client";

import Link from "next/link";
import { HeroAnimation } from "@/components/HeroAnimation";
import { ToolCard } from "@/components/ToolCard";
import { FAQAccordion } from "@/components/FAQAccordion";
import {
  Minimize2,
  Layers,
  Scissors,
  RefreshCw,
  Eraser,
  Stamp,
  ImageIcon,
  Wand2,
  Zap,
  ShieldCheck,
  LogIn,
  Copy,
  Star,
  ArrowRight,
  Calendar,
  LayoutGrid,
} from "lucide-react";

const popularTools = [
  { icon: Minimize2, title: "Resize Image", description: "Change image dimensions while maintaining quality and aspect ratio.", href: "/resize-image", accent: "blue" },
  { icon: Layers, title: "Compress Image", description: "Reduce file size without losing visual quality.", href: "/compress-image", accent: "violet" },
  { icon: RefreshCw, title: "Convert Image", description: "Convert between PNG, JPG, WebP, AVIF, and more.", href: "/convert-image", accent: "cyan" },
  { icon: Scissors, title: "Crop Image", description: "Crop to any aspect ratio or custom dimensions.", href: "/crop-image", accent: "pink" },
  { icon: Eraser, title: "Remove Background", description: "Automatically remove image backgrounds in one click.", href: "/remove-background", accent: "emerald" },
  { icon: Stamp, title: "Watermark Image", description: "Add text or logo watermarks to protect your images.", href: "/watermark-image", accent: "orange" },
  { icon: ImageIcon, title: "Bulk Resizer", description: "Resize multiple images at once with a single setting.", href: "/bulk-resizer", accent: "rose" },
  { icon: Wand2, title: "Image Editor", description: "Adjust brightness, contrast, saturation, blur, and more.", href: "/image-editor", accent: "amber" },
];

const features = [
  { icon: Zap, title: "Lightning Fast", description: "Process images instantly with our optimized pipeline. No waiting.", accent: "text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10" },
  { icon: LogIn, title: "No Login Required", description: "Jump straight into the tool. No account, no email, no friction.", accent: "text-blue-500 bg-blue-50 dark:bg-blue-500/10" },
  { icon: ShieldCheck, title: "Privacy-First", description: "Your images are never stored or shared. Auto-deleted after processing.", accent: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" },
  { icon: Copy, title: "Bulk Processing", description: "Handle dozens of images at once using our powerful bulk tools.", accent: "text-violet-500 bg-violet-50 dark:bg-violet-500/10" },
];

const blogPosts = [
  { title: "How to Compress Images Without Losing Quality", description: "Learn the best techniques to shrink image file sizes while keeping them crisp and professional.", href: "/blog", date: "Jun 15, 2025", tag: "Compression" },
  { title: "Best Image Formats for the Web in 2025", description: "A deep dive into WebP, AVIF, PNG, and JPEG — and when to use each for maximum performance.", href: "/blog", date: "May 28, 2025", tag: "Formats" },
  { title: "How to Remove Image Background Online for Free", description: "Step-by-step guide to removing backgrounds from product photos, portraits, and logos.", href: "/blog", date: "May 10, 2025", tag: "Background Removal" },
];

const homeFAQs = [
  { question: "What is editimage.online?", answer: "editimage.online is a free, all-in-one image processing toolkit. It lets you resize, compress, convert, crop, remove backgrounds, and watermark images — all from your browser, with no signup required." },
  { question: "Do I need to create an account?", answer: "No. All tools are available for free without any account or registration. Just upload your image and start processing." },
  { question: "Is my data safe?", answer: "Yes. We take privacy seriously. Images are processed securely and are never stored or shared with third parties. Files are automatically deleted after download." },
  { question: "Are there any limits on file size?", answer: "You can upload images up to 20MB per file. For bulk processing, you can add up to 20 files at a time." },
];

const howItWorks = [
  {
    step: "01",
    icon: ImageIcon,
    label: "Upload your image",
    desc: "Drag & drop or click to select. Supports PNG, JPG, WebP, GIF & more up to 20MB.",
    color: "from-blue-500 to-blue-600",
    glow: "shadow-blue-500/20",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
  },
  {
    step: "02",
    icon: LayoutGrid,
    label: "Choose a tool",
    desc: "Pick from Resize, Compress, Convert, Crop & many more powerful tools.",
    color: "from-violet-500 to-violet-600",
    glow: "shadow-violet-500/20",
    bg: "bg-violet-50 dark:bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-400",
  },
  {
    step: "03",
    icon: Wand2,
    label: "Configure settings",
    desc: "Set dimensions, quality, output format, and fine-tune your options.",
    color: "from-fuchsia-500 to-pink-600",
    glow: "shadow-fuchsia-500/20",
    bg: "bg-fuchsia-50 dark:bg-fuchsia-500/10",
    text: "text-fuchsia-600 dark:text-fuchsia-400",
  },
  {
    step: "04",
    icon: Zap,
    label: "Download instantly",
    desc: "Get your processed image in seconds — no waiting, no account required.",
    color: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/20",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* ── Hero Section ── */}
      <section className="relative px-4 sm:px-6 lg:px-12 pt-12 sm:pt-20 pb-0 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-[600px] h-[500px] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[150px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        {/* Split layout */}
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-12">
          {/* ── LEFT SIDE ── */}
          <div className="flex-[3] max-w-2xl">
            {/* Rating row */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm font-semibold text-foreground">Rated 4.8 out of 5</span>
              <span className="text-xs text-muted-foreground">(Based on 12,400+ reviews)</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-[4.2rem] font-extrabold leading-[1.05] tracking-tight text-foreground mb-6">
              All-in-One{" "}
              <span className="brand-gradient-text">Image</span>
              <br />
              <span className="brand-gradient-text">Processing</span>{" "}Toolkit
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl mb-12">
              Resize, compress, convert, crop, and enhance images instantly —{" "}
              fast, free, and privacy-first. No account needed.
            </p>

            {/* CTA Buttons — clean, big, no shadow */}
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
              <Link
                href="/tools"
                id="hero-browse-tools"
                className="inline-flex items-center justify-center gap-2.5 px-10 py-[1.1rem] rounded-full bg-foreground text-background font-bold text-[1.05rem] hover:opacity-85 transition-all duration-200 min-w-[230px]"
              >
                <LayoutGrid size={19} />
                Browse All Tools
              </Link>
              <Link
                href="/resize-image"
                id="hero-try-resize"
                className="inline-flex items-center justify-center gap-2.5 px-10 py-[1.1rem] rounded-full border-2 border-foreground/25 bg-transparent text-foreground font-bold text-[1.05rem] hover:border-foreground/50 hover:bg-foreground/5 transition-all duration-200 min-w-[230px]"
              >
                Try Resize Free
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-500" />
                Scam Adviser Verified
              </span>
              <span className="flex items-center gap-1.5">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                Trusted by 2.6M+ users
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-blue-500" />
                SSL Encrypted
              </span>
            </div>
          </div>

          {/* ── RIGHT SIDE — Animated Canvas ── */}
          <div className="flex-[2] w-full max-w-md relative">
            {/* subtle glow behind */}
            <div className="absolute inset-0 brand-gradient rounded-3xl opacity-8 blur-3xl scale-90 -z-10" />
            <HeroAnimation />
          </div>
        </div>

        {/* ── How It Works — Horizontal Strip ── */}
        <div className="max-w-7xl mx-auto mt-14">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">
            How It Works
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 rounded-3xl overflow-hidden border border-border shadow-2xl bg-card">
            {howItWorks.map(({ step, icon: Icon, label, desc, color, bg, text }, idx) => (
              <div
                key={step}
                className={`relative flex flex-col gap-4 p-7 group hover:bg-muted/40 transition-colors duration-200 ${
                  idx < howItWorks.length - 1
                    ? "border-b lg:border-b-0 lg:border-r border-border"
                    : ""
                }`}
              >
                {/* Step watermark */}
                <span className="absolute top-5 right-5 text-5xl font-black text-foreground/5 select-none leading-none pointer-events-none">
                  {step}
                </span>

                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center`}>
                  <Icon size={22} className={text} />
                </div>

                {/* Arrow connector (lg only) */}
                {idx < howItWorks.length - 1 && (
                  <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-6 h-6 rounded-full items-center justify-center bg-background border border-border shadow-sm">
                    <ArrowRight size={10} className="text-muted-foreground" />
                  </div>
                )}

                <div>
                  <p className={`text-sm font-bold mb-1.5 ${text}`}>{label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>

                {/* Bottom accent bar on hover */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Tools ── */}
      <section className="px-6 py-16 bg-muted/30 dark:bg-white/2 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">Popular Tools</h2>
            <p className="text-muted-foreground">Everything you need to process images — in one place.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularTools.map((tool) => (
              <ToolCard key={tool.href} {...tool} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline underline-offset-4">
              View all tools <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>


      {/* ── Features ── */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">Why editimage.online?</h2>
            <p className="text-muted-foreground">Built for speed, privacy, and simplicity.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, description, accent }) => (
              <div key={title} className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-card shadow-sm">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blog Preview ── */}
      <section className="px-6 py-16 bg-muted/30 dark:bg-white/2">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-1">From the Blog</h2>
              <p className="text-muted-foreground text-sm">Guides & tips on image optimization.</p>
            </div>
            <Link href="/blog" className="text-sm font-semibold text-primary hover:underline underline-offset-4 items-center gap-1 hidden sm:flex">
              All articles <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Link key={post.title} href={post.href} className="group block p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">{post.tag}</span>
                </div>
                <h3 className="text-sm font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{post.description}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar size={12} />
                  {post.date}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <FAQAccordion items={homeFAQs} />
        </div>
      </section>
    </div>
  );
}
