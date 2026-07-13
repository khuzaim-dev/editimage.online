"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface BeforeAfterCompareProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export function BeforeAfterCompare({
  beforeSrc,
  afterSrc,
  beforeLabel = "Original",
  afterLabel = "Processed",
}: BeforeAfterCompareProps) {
  const [sliderPos, setSliderPos] = useState(50);
  const [dragging, setDragging] = useState(false);

  const handleMove = (clientX: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-border bg-muted/30 dark:bg-white/3">
      <div
        className="relative w-full h-64 lg:h-80 cursor-col-resize select-none"
        onMouseMove={(e) => {
          if (!dragging) return;
          handleMove(e.clientX, e.currentTarget.getBoundingClientRect());
        }}
        onMouseDown={(e) => {
          setDragging(true);
          handleMove(e.clientX, e.currentTarget.getBoundingClientRect());
        }}
        onMouseUp={() => setDragging(false)}
        onMouseLeave={() => setDragging(false)}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          handleMove(touch.clientX, e.currentTarget.getBoundingClientRect());
        }}
      >
        {/* Before */}
        <div className="absolute inset-0">
          <Image src={beforeSrc} alt={beforeLabel} fill className="object-cover" />
          <span className="absolute top-3 left-3 text-xs font-semibold bg-black/50 text-white px-2 py-1 rounded-md backdrop-blur-sm">
            {beforeLabel}
          </span>
        </div>

        {/* After (clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
        >
          <Image src={afterSrc} alt={afterLabel} fill className="object-cover" />
          <span className="absolute top-3 right-3 text-xs font-semibold bg-primary/80 text-white px-2 py-1 rounded-md backdrop-blur-sm">
            {afterLabel}
          </span>
        </div>

        {/* Slider handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg cursor-col-resize"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg border-2 border-primary flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M4 7H1M10 7h3M4 7l2-2M4 7l2 2M10 7l-2-2M10 7l-2 2" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex border-t border-border">
        <div className="flex-1 text-center text-xs font-medium text-muted-foreground py-2">{beforeLabel}</div>
        <div className="w-px bg-border" />
        <div className="flex-1 text-center text-xs font-medium text-primary py-2">{afterLabel}</div>
      </div>
    </div>
  );
}
