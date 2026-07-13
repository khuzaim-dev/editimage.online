"use client";

import { useState, useCallback } from "react";
import { ToolPageTemplate } from "@/components/ToolPageTemplate";
import { UploadDropzone, UploadedFile } from "@/components/UploadDropzone";
import { SettingsPanel, SettingRow } from "@/components/SettingsPanel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Minimize2,
  Layers,
  RefreshCw,
  Wand2,
  X,
  FileImage,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Download,
  Archive,
} from "lucide-react";
import Image from "next/image";
import { useSession } from "@/shared/hooks/useSession";

type Operation = "resize" | "compress";
type ProcessState = "idle" | "processing" | "done" | "error";

const relatedTools = [
  { icon: Minimize2, title: "Resize Image", description: "Resize a single image.", href: "/resize-image", accent: "blue" },
  { icon: Layers, title: "Compress Image", description: "Reduce file size.", href: "/compress-image", accent: "violet" },
  { icon: RefreshCw, title: "Convert Image", description: "Convert between formats.", href: "/convert-image", accent: "cyan" },
  { icon: Wand2, title: "Image Editor", description: "Edit brightness, contrast & more.", href: "/image-editor", accent: "amber" },
];

const faqs = [
  { question: "How does bulk resizing work?", answer: "Upload multiple images, set your target width and height, and click Process All. All files will be resized and packaged into a ZIP for download." },
  { question: "How many images can I upload at once?", answer: "You can upload up to 20 images per batch." },
  { question: "Is it free?", answer: "Yes, fully free. No account required." },
  { question: "Will bulk processing reduce quality?", answer: "No, we use the same high-quality resampling as our single-image resize tool." },
  { question: "Can I compress instead of resize?", answer: "Yes! Switch to 'Compress' mode and set a quality level to reduce file sizes across all images at once." },
];

export default function BulkResizerPage() {
  const sessionId = useSession();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [operation, setOperation] = useState<Operation>("resize");
  const [width, setWidth] = useState("1920");
  const [height, setHeight] = useState("1080");
  const [quality, setQuality] = useState([80]);
  const [state, setState] = useState<ProcessState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [resultCount, setResultCount] = useState<number | null>(null);

  const addFile = (f: UploadedFile) => {
    setFiles((prev) => (prev.length < 20 ? [...prev, f] : prev));
    setState("idle");
    setError(null);
  };
  const removeFile = (i: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setState("idle");
  };

  const handleProcessAll = useCallback(async () => {
    if (!files.length || !sessionId) return;

    setState("processing");
    setError(null);
    setResultCount(null);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f.file));
      formData.append("operation", operation);
      formData.append("quality", quality[0].toString());
      if (operation === "resize") {
        if (width) formData.append("width", width);
        if (height) formData.append("height", height);
      }
      formData.append("format", "jpeg");

      const res = await fetch("/api/bulk", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      const blob = await res.blob();
      setResultCount(files.length);

      // Trigger download of ZIP
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pixelforge-bulk.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setState("done");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Processing failed";
      setError(msg);
      setState("error");
    }
  }, [files, sessionId, operation, width, height, quality]);

  const isProcessing = state === "processing";

  return (
    <ToolPageTemplate
      title="Bulk Image Resizer"
      description="Resize or compress multiple images at once with a single configuration. Upload up to 20 images, set dimensions or quality, and download them all as a ZIP archive."
      badge="Free Tool"
      uploadArea={
        <div className="space-y-3">
          <UploadDropzone onFileSelected={addFile} compact />
          {files.length > 0 && (
            <div className="rounded-2xl border border-border bg-muted/30 p-3 space-y-2 max-h-60 overflow-y-auto">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-background rounded-xl px-3 py-2 border border-border">
                  <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={f.preview} alt={f.file.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate text-foreground">{f.file.name}</p>
                    <p className="text-xs text-muted-foreground">{(f.file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Remove file"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground text-center">{files.length}/20 images added</p>
        </div>
      }
      settingsPanel={
        <SettingsPanel title="Bulk Settings">
          {/* Operation Toggle */}
          <SettingRow label="Operation">
            <div className="grid grid-cols-2 gap-2">
              {(["resize", "compress"] as Operation[]).map((op) => (
                <button
                  key={op}
                  onClick={() => { setOperation(op); setState("idle"); }}
                  className={`px-3 py-2.5 rounded-xl border text-left transition-all duration-150 capitalize text-xs font-semibold ${
                    operation === op
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {op === "resize" ? "📐 Resize" : "📦 Compress"}
                </button>
              ))}
            </div>
          </SettingRow>

          {operation === "resize" && (
            <>
              <SettingRow label="Width (px)">
                <Input
                  id="bulk-width"
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="rounded-xl h-10"
                  placeholder="e.g. 1920"
                />
              </SettingRow>
              <SettingRow label="Height (px)">
                <Input
                  id="bulk-height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="rounded-xl h-10"
                  placeholder="e.g. 1080"
                />
              </SettingRow>
            </>
          )}

          <SettingRow label={`Quality — ${quality[0]}%`}>
            <Slider
              id="bulk-quality"
              min={10}
              max={100}
              step={1}
              value={quality}
              onValueChange={(val) => setQuality(Array.isArray(val) ? [...(val as number[])] : [val as number])}
              className="mt-1"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Smaller files</span>
              <span>Higher quality</span>
            </div>
          </SettingRow>

          {/* Process All Button */}
          <Button
            id="bulk-process-btn"
            className="w-full brand-gradient text-white font-semibold h-11 rounded-xl hover:opacity-90 transition-opacity mt-2"
            onClick={handleProcessAll}
            disabled={files.length === 0 || isProcessing}
          >
            {isProcessing ? (
              <><Loader2 size={16} className="mr-2 animate-spin" /> Processing {files.length} image{files.length !== 1 ? "s" : ""}…</>
            ) : (
              <><Archive size={16} className="mr-2" /> Process All & Download ZIP</>
            )}
          </Button>

          {/* Status feedback */}
          {state === "done" && resultCount && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl px-3 py-2 mt-1">
              <CheckCircle2 size={14} />
              <span>Done! {resultCount} image{resultCount !== 1 ? "s" : ""} processed — ZIP download started.</span>
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
        files.length === 0 ? undefined : (
          <div className="rounded-2xl border border-border bg-muted/10 p-6">
            <p className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileImage size={16} className="text-primary" />
              Queue ({files.length} image{files.length !== 1 ? "s" : ""})
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {files.map((f, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                  <Image src={f.preview} alt={f.file.name} fill className="object-cover" />
                  {state === "done" && (
                    <div className="absolute inset-0 bg-emerald-500/40 flex items-center justify-center">
                      <CheckCircle2 size={20} className="text-white" />
                    </div>
                  )}
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
            {state === "done" && (
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Download size={12} />
                Your ZIP file was downloaded automatically.
              </div>
            )}
          </div>
        )
      }
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
