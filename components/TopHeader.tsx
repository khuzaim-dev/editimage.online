"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { User, Menu, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { SidebarNavLinks } from "@/components/AppSidebar";
import { cn } from "@/lib/utils";

export function TopHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 px-4 sm:px-6 py-3 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md border-b border-border">
        {/* Mobile: Hamburger + Logo */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            id="mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Menu size={20} />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/editimage-logo.svg"
              alt="editimage.online"
              width={120}
              height={28}
              className="object-contain"
              priority
            />
          </Link>
        </div>

        {/* Desktop: empty left side (sidebar handles logo) */}
        <div className="hidden lg:block" />

        {/* Right nav — always visible */}
        <div className="flex items-center gap-1">
          <Link href="/tools" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}>
            Pricing
          </Link>
          <Link href="/bulk-resizer" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}>
            Bulk
          </Link>
          <Link href="/blog" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}>
            Support
          </Link>
          <Button size="sm" variant="outline" className="gap-1.5">
            <User size={14} />
            <span className="hidden sm:inline">My Account</span>
          </Button>
        </div>
      </header>

      {/* ── Mobile Drawer Overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer panel */}
          <aside
            className={cn(
              "absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-[#0f172a] shadow-2xl flex flex-col",
              "animate-in slide-in-from-left duration-300"
            )}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5"
              >
                <Image
                  src="/editimage-logo.svg"
                  alt="editimage.online"
                  width={130}
                  height={30}
                  className="object-contain"
                  priority
                />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tool links */}
            <SidebarNavLinks onLinkClick={() => setMobileOpen(false)} />

            {/* Drawer Footer */}
            <div className="px-4 py-4 border-t border-border space-y-2">
              <Link
                href="/tools"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-full py-2.5 rounded-xl brand-gradient text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Browse All Tools
              </Link>
              <div className="flex items-center justify-around text-xs text-muted-foreground pt-1">
                <Link href="/tools" onClick={() => setMobileOpen(false)} className="hover:text-foreground transition-colors">Pricing</Link>
                <Link href="/bulk-resizer" onClick={() => setMobileOpen(false)} className="hover:text-foreground transition-colors">Bulk</Link>
                <Link href="/blog" onClick={() => setMobileOpen(false)} className="hover:text-foreground transition-colors">Support</Link>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
