"use client";

import { useState } from "react";
import { ToolPageTemplate } from "@/components/ToolPageTemplate";
import { UploadDropzone, UploadedFile } from "@/components/UploadDropzone";
import { SettingsPanel, SettingRow } from "@/components/SettingsPanel";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Minimize2, Layers, Scissors, Stamp, Wand2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useSession } from "@/shared/hooks/useSession";
import { useImageProcessor } from "@/shared/hooks/useImageProcessor";
import Image from "next/image";

const relatedTools = [
  { icon: Minimize2, title: "Resize Image", description: "Change image dimensions.", href: "/resize-image", accent: "blue" },
  { icon: Layers, title: "Compress Image", description: "Reduce file size.", href: "/compress-image", accent: "violet" },
  { icon: Scissors, title: "Crop Image", description: "Crop to any aspect ratio.", href: "/crop-image", accent: "pink" },
  { icon: Stamp, title: "Watermark Image", description: "Add watermarks to protect.", href: "/watermark-image", accent: "orange" },
];

const faqs = [
  { question: "What adjustments can I make?", answer: "Adjust brightness, contrast (via saturation), blur, sharpness, and apply Grayscale, Sepia, and Invert filters." },
  { question: "Are the edits non-destructive?", answer: "Yes. All adjustments are applied to a processed copy of your image. Your original is never modified." },
  { question: "Is it free?", answer: "Yes, 100% free. No signup needed." },
  { question: "Can I reset all changes?", answer: "Yes. Click the Reset button to restore all sliders to their default values instantly." },
];

const FILTERS = ["None", "Grayscale", "Sepia", "Invert", "Vivid"];

export default function ImageEditorPage() {
  const sessionId = useSession();
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [brightness, setBrightness] = useState([0]);
  const [saturation, setSaturation] = useState([0]);
  const [blur, setBlur] = useState([0]);
  const [filter, setFilter] = useState("None");

  const { state, error, resultSize, process, reset } = useImageProcessor({
    apiRoute: "/api/edit",
    sessionId,
    outputFileName: "edited.jpeg",
  });

  const isProcessing = state === "uploading" || state === "processing";

  const handleReset = () => {
    setBrightness([0]);
    setSaturation([0]);
    setBlur([0]);
    setFilter("None");
    reset();
  };

  return (
    <ToolPageTemplate
      title="Image Editor"
      description="Fine-tune your images with powerful controls: adjust brightness, saturation, blur, and apply artistic filters — all powered by Sharp on our backend."
      badge="Free Tool"
      uploadArea={
        <UploadDropzone onFileSelected={(f) => { setUploadedFile(f); reset(); }} />
      }
      settingsPanel={
        <SettingsPanel title="Adjustments">
          <SettingRow label={`Brightness — ${brightness[0] > 0 ? "+" : ""}${brightness[0]}`}>
            <Slider id="brightness" min={-100} max={100} step={1} value={brightness} onValueChange={(val) => setBrightness(Array.isArray(val) ? [...(val as number[])] : [val as number])} />
          </SettingRow>
          <SettingRow label={`Saturation — ${saturation[0] > 0 ? "+" : ""}${saturation[0]}`}>
            <Slider id="saturation" min={-100} max={100} step={1} value={saturation} onValueChange={(val) => setSaturation(Array.isArray(val) ? [...(val as number[])] : [val as number])} />
          </SettingRow>
          <SettingRow label={`Blur — ${blur[0]}`}>
            <Slider id="blur" min={0} max={20} step={0.5} value={blur} onValueChange={(val) => setBlur(Array.isArray(val) ? [...(val as number[])] : [val as number])} />
          </SettingRow>
          <SettingRow label="Filter">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${
                    filter === f
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </SettingRow>

          <div className="flex gap-2 mt-1">
            <Button variant="outline" onClick={handleReset} className="flex-1 rounded-xl h-10 text-sm">
              Reset
            </Button>
            <Button
              id="edit-process-btn"
              className="flex-[2] brand-gradient text-white font-semibold h-10 rounded-xl hover:opacity-90 transition-opacity text-sm"
              onClick={() =>
                uploadedFile &&
                process(uploadedFile.file, {
                  brightness: brightness[0].toString(),
                  saturation: saturation[0].toString(),
                  blur: blur[0].toString(),
                  filter,
                })
              }
              disabled={!uploadedFile || isProcessing}
            >
              {isProcessing ? (
                <><Loader2 size={14} className="mr-2 animate-spin" /> Processing…</>
              ) : (
                <><Wand2 size={14} className="mr-2" /> Apply Edits</>
              )}
            </Button>
          </div>

          {state === "done" && resultSize && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl px-3 py-2">
              <CheckCircle2 size={14} /> Done! {(resultSize / 1024).toFixed(0)} KB — download started.
            </div>
          )}
          {state === "error" && error && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2">
              <AlertCircle size={14} /> {error}
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
              <Image
                src={uploadedFile.preview}
                alt="Preview"
                fill
                className="object-contain transition-all duration-300"
                style={{
                  filter: [
                    filter === "Grayscale" ? "grayscale(1)" : "",
                    filter === "Sepia" ? "sepia(0.8)" : "",
                    filter === "Invert" ? "invert(1)" : "",
                    filter === "Vivid" ? "saturate(1.6)" : "",
                    brightness[0] !== 0 ? `brightness(${1 + brightness[0] / 100})` : "",
                    saturation[0] !== 0 ? `saturate(${1 + saturation[0] / 100})` : "",
                    blur[0] > 0 ? `blur(${blur[0] / 5}px)` : "",
                  ].filter(Boolean).join(" "),
                }}
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
