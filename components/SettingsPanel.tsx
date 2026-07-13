"use client";

import { ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsPanelProps {
  children: ReactNode;
  title?: string;
  collapsible?: boolean;
}

export function SettingsPanel({
  children,
  title = "Settings",
  collapsible = true,
}: SettingsPanelProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <button
        className={cn(
          "w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-foreground",
          collapsible && "cursor-pointer hover:bg-muted/50 transition-colors"
        )}
        onClick={() => collapsible && setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{title}</span>
        {collapsible && (
          <ChevronDown
            size={16}
            className={cn("text-muted-foreground transition-transform duration-200", open ? "" : "-rotate-90")}
          />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-border pt-4 space-y-5">
          {children}
        </div>
      )}
    </div>
  );
}

/* ───── Reusable setting sub-components ───── */

export function SettingRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}
