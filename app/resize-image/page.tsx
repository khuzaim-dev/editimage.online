"use client";

import { useState } from "react";
import { ToolPageTemplate } from "@/components/ToolPageTemplate";
import { UploadDropzone, UploadedFile } from "@/components/UploadDropzone";
import { SettingsPanel, SettingRow } from "@/components/SettingsPanel";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Minimize2, Layers, Scissors, RefreshCw, Eraser,
  Loader2, CheckCircle2, AlertCircle, Link, Unlink,
} from "lucide-react";
import { useSession } from "@/shared/hooks/useSession";
import { useImageProcessor } from "@/shared/hooks/useImageProcessor";
import Image from "next/image";
import { cn } from "@/lib/utils";

// ─── Social Media Presets ────────────────────────────────────────────────────

const SOCIAL_PRESETS = [
  {
    platform: "Instagram",
    presets: [
      { name: "Post (Square)", width: 1080, height: 1080 },
      { name: "Story / Reel", width: 1080, height: 1920 },
      { name: "Profile Photo", width: 320, height: 320 },
    ],
  },
  {
    platform: "Facebook",
    presets: [
      { name: "Post", width: 1200, height: 630 },
      { name: "Cover Photo", width: 820, height: 312 },
    ],
  },
  {
    platform: "YouTube",
    presets: [
      { name: "Thumbnail", width: 1280, height: 720 },
      { name: "Channel Banner", width: 2560, height: 1440 },
    ],
  },
  {
    platform: "LinkedIn",
    presets: [
      { name: "Profile Photo", width: 400, height: 400 },
      { name: "Banner", width: 1584, height: 396 },
    ],
  },
];

const PERCENTAGE_OPTIONS = [25, 50, 75, 100, 150, 200];

const FORMAT_OPTIONS = [
  { value: "jpeg", label: "JPG" },
  { value: "png",  label: "PNG" },
  { value: "webp", label: "WebP" },
];

// ─── Related / FAQs ─────────────────────────────────────────────────────────

const relatedTools = [
  { icon: Layers,   title: "Compress Image",    description: "Reduce file size without losing quality.", href: "/compress-image",   accent: "violet" },
  { icon: Scissors, title: "Crop Image",         description: "Crop to any aspect ratio.",               href: "/crop-image",        accent: "pink"   },
  { icon: RefreshCw,title: "Convert Image",      description: "Convert between image formats.",          href: "/convert-image",     accent: "cyan"   },
  { icon: Eraser,   title: "Remove Background",  description: "Remove image backgrounds instantly.",     href: "/remove-background", accent: "emerald"},
];

const faqs = [
  { question: "How does the resize tool work?", answer: "Upload your image, choose a resize mode, then click Resize Image. The tool resamples your image using a Sharp-based engine for high-quality output." },
  { question: "Will resizing reduce image quality?", answer: "Downscaling preserves clarity. Upscaling may introduce softness. We use Lanczos resampling for best results." },
  { question: "Which formats are supported?", answer: "JPG, PNG, and WebP. You can convert format during the resize step using the Format option." },
  { question: "Is it free?", answer: "Yes, completely free. No account needed." },
  { question: "Is my image safe?", answer: "Images are processed securely and auto-deleted immediately after processing. We never store or share your files." },
];

// ─── Component ───────────────────────────────────────────────────────────────

type ResizeMode = "custom" | "percentage" | "social";

export default function ResizeImagePage() {
  const sessionId = useSession();

  // Upload state
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  // Mode
  const [mode, setMode] = useState<ResizeMode>("custom");

  // Custom dimensions
  const [width, setWidth]  = useState("1920");
  const [height, setHeight] = useState("1080");
  const [lockAspect, setLockAspect] = useState(true);

  // Percentage
  const [percentage, setPercentage] = useState(100);

  // Format
  const [format, setFormat] = useState<"jpeg" | "png" | "webp">("jpeg");

  // Processor
  const { state, error, resultSize, process, reset } = useImageProcessor({
    apiRoute: "/api/resize",
    sessionId,
    outputFileName: `resized.${format}`,
  });

  const isProcessing = state === "uploading" || state === "processing";

  // ── Handlers ────────────────────────────────────────────────────────────────

  const onFileSelected = (f: UploadedFile) => {
    setUploadedFile(f);
    if (f.width && f.height) {
      setWidth(f.width.toString());
      setHeight(f.height.toString());
    }
    reset();
  };

  const handleWidthChange = (val: string) => {
    setWidth(val);
    if (lockAspect && uploadedFile?.width && uploadedFile?.height && val) {
      const ratio = uploadedFile.height / uploadedFile.width;
      setHeight(Math.round(parseInt(val) * ratio).toString());
    }
  };

  const handleHeightChange = (val: string) => {
    setHeight(val);
    if (lockAspect && uploadedFile?.width && uploadedFile?.height && val) {
      const ratio = uploadedFile.width / uploadedFile.height;
      setWidth(Math.round(parseInt(val) * ratio).toString());
    }
  };

  const handlePercentageChange = (pct: number) => {
    setPercentage(pct);
    if (uploadedFile?.width && uploadedFile?.height) {
      setWidth(Math.round(uploadedFile.width  * (pct / 100)).toString());
      setHeight(Math.round(uploadedFile.height * (pct / 100)).toString());
    }
  };

  const handlePresetSelect = (w: number, h: number) => {
    setWidth(w.toString());
    setHeight(h.toString());
  };

  const handleProcess = async () => {
    if (!uploadedFile) return;
    await process(uploadedFile.file, { width, height, format, quality: "90" });
  };

  // ── Derived values ───────────────────────────────────────────────────────────

  const origSizeKB   = uploadedFile ? (uploadedFile.file.size / 1024).toFixed(0) : "—";
  const origFormat   = uploadedFile ? uploadedFile.file.type.replace("image/", "").toUpperCase() : "—";
  const origW        = uploadedFile?.width  ?? "—";
  const origH        = uploadedFile?.height ?? "—";
  const newDims      = `${width} × ${height}`;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <ToolPageTemplate
      title="Resize Image"
      description="Resize any image to exact dimensions, by percentage, or using social media presets. Supports JPG, PNG, and WebP. Powered by Sharp."
      badge="Free Tool"
      uploadArea={
        <UploadDropzone
          onFileSelected={onFileSelected}
          accept="image/png,image/jpeg,image/webp"
        />
      }
      settingsPanel={
        <div className="flex flex-col gap-4">
          {/* Image Info — shown after upload */}
          {uploadedFile && (
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <p className="text-sm font-semibold text-foreground">Image Info</p>
              </div>
              <div className="px-5 py-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <span className="text-muted-foreground">Original size</span>
                <span className="font-medium text-right">{origW} × {origH} px</span>
                <span className="text-muted-foreground">Format</span>
                <span className="font-medium text-right">{origFormat}</span>
                <span className="text-muted-foreground">File size</span>
                <span className="font-medium text-right">{origSizeKB} KB</span>
                <span className="text-muted-foreground">New dimensions</span>
                <span className="font-semibold text-primary text-right">{newDims} px</span>
              </div>
            </div>
          )}

          {/* Mode Selector */}
          <SettingsPanel title="Resize Mode" collapsible={false}>
            <div className="flex rounded-xl overflow-hidden border border-border">
              {(["custom", "percentage", "social"] as ResizeMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "flex-1 py-2 text-xs font-semibold capitalize transition-colors",
                    mode === m
                      ? "brand-gradient text-white"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {m === "custom" ? "Custom" : m === "percentage" ? "Percent" : "Social"}
                </button>
              ))}
            </div>

            {/* ── Mode: Custom ── */}
            {mode === "custom" && (
              <div className="space-y-4 pt-1">
                <SettingRow label="Width (px)">
                  <Input
                    id="resize-width"
                    type="number"
                    min={1}
                    value={width}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    className="rounded-xl h-10"
                    placeholder="e.g. 1920"
                  />
                </SettingRow>
                <SettingRow label="Height (px)">
                  <Input
                    id="resize-height"
                    type="number"
                    min={1}
                    value={height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className="rounded-xl h-10"
                    placeholder="e.g. 1080"
                  />
                </SettingRow>
                <div className="flex items-center justify-between">
                  <Label htmlFor="lock-aspect" className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer">
                    {lockAspect ? <Link size={13} /> : <Unlink size={13} />}
                    Lock Aspect Ratio
                  </Label>
                  <Switch id="lock-aspect" checked={lockAspect} onCheckedChange={setLockAspect} />
                </div>
              </div>
            )}

            {/* ── Mode: Percentage ── */}
            {mode === "percentage" && (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-muted-foreground">
                  Scale relative to the original image dimensions.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {PERCENTAGE_OPTIONS.map((pct) => (
                    <button
                      key={pct}
                      onClick={() => handlePercentageChange(pct)}
                      className={cn(
                        "rounded-xl py-2 text-sm font-semibold border transition-colors",
                        percentage === pct
                          ? "brand-gradient text-white border-transparent"
                          : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
                {uploadedFile ? (
                  <p className="text-xs text-center text-muted-foreground pt-1">
                    Result: {width} × {height} px
                  </p>
                ) : (
                  <p className="text-xs text-center text-muted-foreground pt-1">
                    Upload an image to see output dimensions.
                  </p>
                )}
              </div>
            )}

            {/* ── Mode: Social Media Presets ── */}
            {mode === "social" && (
              <div className="space-y-4 pt-1">
                {SOCIAL_PRESETS.map((group) => (
                  <div key={group.platform}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {group.platform}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {group.presets.map((preset) => {
                        const isActive = width === preset.width.toString() && height === preset.height.toString();
                        return (
                          <button
                            key={preset.name}
                            onClick={() => handlePresetSelect(preset.width, preset.height)}
                            className={cn(
                              "flex items-center justify-between px-3 py-2 rounded-xl border text-sm transition-colors text-left",
                              isActive
                                ? "brand-gradient text-white border-transparent font-semibold"
                                : "border-border bg-muted/20 text-muted-foreground hover:bg-muted"
                            )}
                          >
                            <span>{preset.name}</span>
                            <span className={cn("text-xs", isActive ? "text-white/80" : "opacity-60")}>
                              {preset.width} × {preset.height}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SettingsPanel>

          {/* Format Selector */}
          <SettingsPanel title="Output Format" collapsible={false}>
            <div className="flex rounded-xl overflow-hidden border border-border">
              {FORMAT_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value as "jpeg" | "png" | "webp")}
                  className={cn(
                    "flex-1 py-2 text-xs font-semibold transition-colors",
                    format === f.value
                      ? "brand-gradient text-white"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </SettingsPanel>

          {/* Action Button */}
          <Button
            id="resize-process-btn"
            className="w-full brand-gradient text-white font-semibold h-11 rounded-xl hover:opacity-90 transition-opacity"
            onClick={handleProcess}
            disabled={!uploadedFile || isProcessing}
          >
            {isProcessing ? (
              <><Loader2 size={16} className="mr-2 animate-spin" /> Processing…</>
            ) : (
              <><Minimize2 size={16} className="mr-2" /> Resize Image</>
            )}
          </Button>

          {/* Status Messages */}
          {state === "done" && resultSize && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl px-3 py-2">
              <CheckCircle2 size={14} />
              Done! Output: {(resultSize / 1024).toFixed(0)} KB — download started.
            </div>
          )}
          {state === "error" && error && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>
      }
      previewSection={
        uploadedFile ? (
          <div className="rounded-2xl border border-border bg-muted/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preview</span>
              <span className="text-xs text-muted-foreground">
                {uploadedFile.width} × {uploadedFile.height} px · {origFormat} · {origSizeKB} KB
              </span>
            </div>
            <div className="relative aspect-video w-full bg-muted/30">
              <Image
                src={uploadedFile.preview}
                alt="Preview"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="px-4 py-3 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">
                Output will be <span className="font-semibold text-foreground">{newDims} px</span> · {FORMAT_OPTIONS.find(f => f.value === format)?.label}
              </p>
            </div>
          </div>
        ) : undefined
      }
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
