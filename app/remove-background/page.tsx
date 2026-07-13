"use client";

import { useState } from "react";
import { ToolPageTemplate } from "@/components/ToolPageTemplate";
import { UploadDropzone, UploadedFile } from "@/components/UploadDropzone";
import { SettingsPanel, SettingRow } from "@/components/SettingsPanel";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Minimize2,
  Layers,
  Stamp,
  Wand2,
  Eraser,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { useSession } from "@/shared/hooks/useSession";
import { useImageProcessor } from "@/shared/hooks/useImageProcessor";

const relatedTools = [
  { icon: Minimize2, title: "Resize Image", description: "Change image dimensions.", href: "/resize-image", accent: "blue" },
  { icon: Layers, title: "Compress Image", description: "Reduce file size.", href: "/compress-image", accent: "violet" },
  { icon: Stamp, title: "Watermark Image", description: "Add watermarks to your images.", href: "/watermark-image", accent: "orange" },
  { icon: Wand2, title: "Image Editor", description: "Adjust brightness, contrast & more.", href: "/image-editor", accent: "amber" },
];

const faqs = [
  {
    question: "How does background removal work?",
    answer:
      "Our tool uses luminance-based masking via Sharp to detect the main subject and separate it from the background. It works best on images with a clear contrast between subject and background.",
  },
  {
    question: "What types of images work best?",
    answer:
      "Clear subjects on plain or high-contrast backgrounds work best — portraits, product photos on white, and logos. Complex scenes with similar colors may produce less precise results.",
  },
  { question: "Is it free?", answer: "Yes, completely free. No login required." },
  {
    question: "What format does the output use?",
    answer:
      "The output is always a transparent PNG file so you can place it on any background color or design.",
  },
];

export default function RemoveBackgroundPage() {
  const sessionId = useSession();
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [refine, setRefine] = useState(true);

  const { state, error, resultSize, process, reset } = useImageProcessor({
    apiRoute: "/api/remove-bg",
    sessionId,
    outputFileName: "removed-bg.png",
  });

  const isProcessing = state === "uploading" || state === "processing";

  const handleProcess = async () => {
    if (!uploadedFile) return;
    await process(uploadedFile.file, { refine: refine.toString() });
  };

  return (
    <ToolPageTemplate
      title="Remove Background"
      description="Automatically remove the background from any image in one click. Perfect for product photos, portraits, logos, and social media content. Outputs transparent PNG."
      badge="AI-Powered"
      uploadArea={
        <UploadDropzone
          onFileSelected={(f) => {
            setUploadedFile(f);
            reset();
          }}
        />
      }
      settingsPanel={
        <SettingsPanel title="Removal Settings">
          <SettingRow label="Options">
            <div className="flex items-center justify-between py-1">
              <Label htmlFor="refine-edges" className="text-sm text-foreground">
                Refine Edges
              </Label>
              <Switch id="refine-edges" checked={refine} onCheckedChange={setRefine} />
            </div>
          </SettingRow>

          <Button
            id="remove-bg-process-btn"
            className="w-full brand-gradient text-white font-semibold h-11 rounded-xl hover:opacity-90 transition-opacity mt-2"
            onClick={handleProcess}
            disabled={!uploadedFile || isProcessing}
          >
            {isProcessing ? (
              <><Loader2 size={16} className="mr-2 animate-spin" /> Removing Background…</>
            ) : (
              <><Eraser size={16} className="mr-2" /> Remove Background</>
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
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Preview
              </span>
              <span className="text-xs text-muted-foreground">
                {(uploadedFile.file.size / 1024).toFixed(0)} KB original
              </span>
            </div>
            {/* Checkerboard background to show transparency */}
            <div
              className="relative aspect-video w-full"
              style={{
                backgroundImage:
                  "repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%) 0 0 / 20px 20px",
              }}
            >
              <Image
                src={uploadedFile.preview}
                alt="Preview"
                fill
                className="object-contain"
              />
            </div>
          </div>
        ) : undefined
      }
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
