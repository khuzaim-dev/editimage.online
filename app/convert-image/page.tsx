"use client";

import { useState } from "react";
import { ToolPageTemplate } from "@/components/ToolPageTemplate";
import { UploadDropzone, UploadedFile } from "@/components/UploadDropzone";
import { SettingsPanel, SettingRow } from "@/components/SettingsPanel";
import { Button } from "@/components/ui/button";
import { Minimize2, Layers, Scissors, RefreshCw, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useSession } from "@/shared/hooks/useSession";
import { useImageProcessor } from "@/shared/hooks/useImageProcessor";
import Image from "next/image";

type Format = "webp" | "jpeg" | "png" | "avif" | "gif";
const FORMATS: { value: Format; label: string; badge: string }[] = [
  { value: "webp", label: "WebP", badge: "Best for Web" },
  { value: "jpeg", label: "JPEG", badge: "Universal" },
  { value: "png", label: "PNG", badge: "Lossless" },
  { value: "avif", label: "AVIF", badge: "Next-Gen" },
  { value: "gif", label: "GIF", badge: "Animated" },
];

const relatedTools = [
  { icon: Minimize2, title: "Resize Image", description: "Change image dimensions.", href: "/resize-image", accent: "blue" },
  { icon: Layers, title: "Compress Image", description: "Reduce file size.", href: "/compress-image", accent: "violet" },
  { icon: Scissors, title: "Crop Image", description: "Crop to any aspect ratio.", href: "/crop-image", accent: "pink" },
];

const faqs = [
  { question: "What formats can I convert to?", answer: "WebP, JPEG, PNG, AVIF, and GIF. WebP and AVIF are recommended for modern web use as they offer the best compression with great quality." },
  { question: "Will converting change the image quality?", answer: "Converting between lossy formats (JPEG, WebP) may slightly reduce quality. Converting from JPEG to PNG creates a larger lossless copy." },
  { question: "Is it free?", answer: "Yes, completely free." },
  { question: "What is AVIF?", answer: "AVIF is a next-generation format that offers 50% smaller files than JPEG at the same perceived quality. It is increasingly supported by modern browsers." },
];

export default function ConvertImagePage() {
  const sessionId = useSession();
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [format, setFormat] = useState<Format>("webp");

  const { state, error, resultSize, process, reset } = useImageProcessor({
    apiRoute: "/api/convert",
    sessionId,
    outputFileName: `converted.${format}`,
  });

  const isProcessing = state === "uploading" || state === "processing";

  return (
    <ToolPageTemplate
      title="Convert Image"
      description="Convert images between WebP, JPEG, PNG, AVIF, and GIF formats in one click. Optimized for web performance and maximum compatibility."
      badge="Free Tool"
      uploadArea={
        <UploadDropzone onFileSelected={(f) => { setUploadedFile(f); reset(); }} />
      }
      settingsPanel={
        <SettingsPanel title="Conversion Settings">
          <SettingRow label="Output Format">
            <div className="grid grid-cols-2 gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  className={`px-3 py-2.5 rounded-xl border text-left transition-all duration-150 ${
                    format === f.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <p className="text-xs font-bold">{f.label}</p>
                  <p className="text-[10px] opacity-70 mt-0.5">{f.badge}</p>
                </button>
              ))}
            </div>
          </SettingRow>

          <Button
            id="convert-process-btn"
            className="w-full brand-gradient text-white font-semibold h-11 rounded-xl hover:opacity-90 transition-opacity"
            onClick={() => uploadedFile && process(uploadedFile.file, { format, quality: "90" })}
            disabled={!uploadedFile || isProcessing}
          >
            {isProcessing ? (
              <><Loader2 size={16} className="mr-2 animate-spin" /> Converting…</>
            ) : (
              <><RefreshCw size={16} className="mr-2" /> Convert to {format.toUpperCase()}</>
            )}
          </Button>

          {state === "done" && resultSize && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl px-3 py-2">
              <CheckCircle2 size={14} />
              Done! Output: {(resultSize / 1024).toFixed(0)} KB
            </div>
          )}
          {state === "error" && error && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </SettingsPanel>
      }
      previewSection={
        uploadedFile ? (
          <div className="rounded-2xl border border-border bg-muted/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preview</span>
            </div>
            <div className="relative aspect-video w-full bg-muted/30">
              <Image src={uploadedFile.preview} alt="Preview" fill className="object-contain" />
            </div>
          </div>
        ) : undefined
      }
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
