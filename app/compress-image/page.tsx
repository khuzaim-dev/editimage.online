"use client";

import { useState } from "react";
import { ToolPageTemplate } from "@/components/ToolPageTemplate";
import { UploadDropzone, UploadedFile } from "@/components/UploadDropzone";
import { SettingsPanel, SettingRow } from "@/components/SettingsPanel";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Minimize2, Scissors, RefreshCw, Wand2, Layers, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useSession } from "@/shared/hooks/useSession";
import { useImageProcessor } from "@/shared/hooks/useImageProcessor";
import Image from "next/image";

const relatedTools = [
  { icon: Minimize2, title: "Resize Image", description: "Change image dimensions instantly.", href: "/resize-image", accent: "blue" },
  { icon: Scissors, title: "Crop Image", description: "Crop to any aspect ratio.", href: "/crop-image", accent: "pink" },
  { icon: RefreshCw, title: "Convert Image", description: "Convert between image formats.", href: "/convert-image", accent: "cyan" },
  { icon: Wand2, title: "Image Editor", description: "Adjust brightness, contrast & more.", href: "/image-editor", accent: "amber" },
];

const faqs = [
  { question: "How does image compression work?", answer: "We analyze your image and reduce redundant data using Sharp's advanced compression, resulting in a smaller file with minimal visible quality loss." },
  { question: "What quality setting should I use?", answer: "For web use, 70-85% is a sweet spot. For print or archives, use 90%+. Lower values mean smaller files but more visible compression artifacts." },
  { question: "Is it free?", answer: "Yes, 100% free. No account needed." },
  { question: "Will compression reduce quality noticeably?", answer: "At 80%+ quality settings, the difference is barely visible to the human eye. Our sliders let you find your perfect balance." },
];

export default function CompressImagePage() {
  const sessionId = useSession();
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [quality, setQuality] = useState([80]);

  const { state, error, resultSize, process, reset } = useImageProcessor({
    apiRoute: "/api/compress",
    sessionId,
    outputFileName: "compressed.jpeg",
  });

  const isProcessing = state === "uploading" || state === "processing";

  const handleProcess = async () => {
    if (!uploadedFile) return;
    await process(uploadedFile.file, { quality: quality[0].toString() });
  };

  return (
    <ToolPageTemplate
      title="Compress Image"
      description="Reduce image file size without sacrificing visual quality. Perfect for web optimization, email attachments, and faster page loads. Powered by Sharp."
      badge="Free Tool"
      uploadArea={
        <UploadDropzone
          onFileSelected={(f) => {
            setUploadedFile(f);
            reset();
          }}
        />
      }
      settingsPanel={
        <SettingsPanel title="Compression Settings">
          <SettingRow label={`Quality — ${quality[0]}%`}>
            <Slider
              id="quality-slider"
              min={10}
              max={100}
              step={1}
              value={quality}
              onValueChange={(val) => setQuality(Array.isArray(val) ? [...(val as number[])] : [val as number])}
              className="mt-1"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Smaller file</span>
              <span>Higher quality</span>
            </div>
          </SettingRow>

          {/* Compression ratio estimate */}
          {uploadedFile && (
            <div className="rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              Original: <span className="font-medium text-foreground">{(uploadedFile.file.size / 1024).toFixed(0)} KB</span>
              {" · "}Est. output: <span className="font-medium text-foreground">
                ~{((uploadedFile.file.size / 1024) * (quality[0] / 100)).toFixed(0)} KB
              </span>
            </div>
          )}

          <Button
            id="compress-process-btn"
            className="w-full brand-gradient text-white font-semibold h-11 rounded-xl hover:opacity-90 transition-opacity mt-2"
            onClick={handleProcess}
            disabled={!uploadedFile || isProcessing}
          >
            {isProcessing ? (
              <><Loader2 size={16} className="mr-2 animate-spin" /> Compressing…</>
            ) : (
              <><Layers size={16} className="mr-2" /> Compress Image</>
            )}
          </Button>

          {state === "done" && resultSize && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl px-3 py-2 mt-1">
              <CheckCircle2 size={14} />
              Done! Output: {(resultSize / 1024).toFixed(0)} KB — download started.
            </div>
          )}
          {state === "error" && error && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2 mt-1">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </SettingsPanel>
      }
      previewSection={
        uploadedFile ? (
          <div className="rounded-2xl border border-border bg-muted/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preview</span>
              <span className="text-xs text-muted-foreground">{(uploadedFile.file.size / 1024).toFixed(0)} KB</span>
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
