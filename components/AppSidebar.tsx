"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Minimize2,
  Scissors,
  RefreshCw,
  Eraser,
  Stamp,
  LayoutGrid,
  Layers,
  Wand2,
  Home,
  FileText,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

export const tools = [
  { icon: Home, label: "Home", href: "/" },
  { icon: LayoutGrid, label: "All Tools", href: "/tools" },
  { icon: Minimize2, label: "Resize Image", href: "/resize-image" },
  { icon: Layers, label: "Compress Image", href: "/compress-image" },
  { icon: Scissors, label: "Crop Image", href: "/crop-image" },
  { icon: RefreshCw, label: "Convert Image", href: "/convert-image" },
  { icon: Eraser, label: "Remove BG", href: "/remove-background" },
  { icon: Stamp, label: "Watermark", href: "/watermark-image" },
  { icon: ImageIcon, label: "Bulk Resizer", href: "/bulk-resizer" },
  { icon: Wand2, label: "Image Editor", href: "/image-editor" },
  { icon: FileText, label: "Blog", href: "/blog" },
];

/** Shared nav link list — used by both sidebar and mobile drawer */
export function SidebarNavLinks({
  collapsed = false,
  onLinkClick,
}: {
  collapsed?: boolean;
  onLinkClick?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 flex flex-col gap-0.5 p-2 overflow-y-auto">
      {tools.map(({ icon: Icon, label, href }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            title={collapsed ? label : undefined}
            onClick={onLinkClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              active
                ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-white/5"
            )}
          >
            <Icon className={cn("flex-shrink-0", active ? "text-primary" : "")} size={18} />
            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

/** Desktop sidebar — hidden on mobile */
export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        // Hidden on mobile, flex on lg+
        "hidden lg:relative lg:flex flex-col h-full bg-white dark:bg-[#0f172a] border-r border-border transition-all duration-300 z-20",
        collapsed ? "lg:w-[60px]" : "lg:w-[220px]"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-2.5 px-4 py-5 border-b border-border", collapsed && "justify-center px-2")}>
        <Link href="/" className={cn("flex items-center gap-2", collapsed && "justify-center")}>
          {collapsed ? (
            /* Icon-only logo for collapsed state */
            <Image
              src="/logo-icon.svg"
              alt="editimage.online"
              width={34}
              height={34}
              className="object-contain"
              priority
            />
          ) : (
            /* Full logo for expanded state */
            <Image
              src="/editimage-logo.svg"
              alt="editimage.online logo"
              width={140}
              height={32}
              className="object-contain"
              priority
            />
          )}
        </Link>
      </div>

      <SidebarNavLinks collapsed={collapsed} />

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-white dark:bg-[#1e293b] border border-border flex items-center justify-center hover:bg-muted transition-colors shadow-sm z-30"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight size={12} className="text-muted-foreground" />
        ) : (
          <ChevronLeft size={12} className="text-muted-foreground" />
        )}
      </button>
    </aside>
  );
}
