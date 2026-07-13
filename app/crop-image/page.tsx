"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
  convertToPixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { ToolPageTemplate } from "@/components/ToolPageTemplate";
import { UploadDropzone, UploadedFile } from "@/components/UploadDropzone";
import { SettingsPanel, SettingRow } from "@/components/SettingsPanel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Minimize2, Layers, RefreshCw, Eraser, Scissors,
  Loader2, CheckCircle2, AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { useSession } from "@/shared/hooks/useSession";
import { useImageProcessor } from "@/shared/hooks/useImageProcessor";
import { cn } from "@/lib/utils";

// ── Aspect Ratio Presets ────────────────────────────────────────────────────

const ASPECT_RATIOS: { label: string; value: number | undefined }[] = [
  { label: "Free",  value: undefined },
  { label: "1:1",   value: 1 },
  { label: "4:3",   value: 4 / 3 },
  { label: "16:9",  value: 16 / 9 },
  { label: "3:2",   value: 3 / 2 },
  { label: "9:16",  value: 9 / 16 },
  { label: "2:3",   value: 2 / 3 },
];

// ── Social / Fixed Size Presets ─────────────────────────────────────────────

const FIXED_PRESETS = [
  { label: "Instagram Post",  width: 1080, height: 1080 },
  { label: "Instagram Story", width: 1080, height: 1920 },
  { label: "Facebook Post",   width: 1200, height: 630 },
  { label: "Facebook Cover",  width: 820,  height: 312 },
  { label: "YouTube Thumb",   width: 1280, height: 720 },
  { label: "LinkedIn Banner", width: 1584, height: 396 },
  { label: "Twitter Header",  width: 1500, height: 500 },
];

// ── Related / FAQs ──────────────────────────────────────────────────────────

const relatedTools = [
  { icon: Minimize2, title: "Resize Image",     description: "Change image dimensions.",    href: "/resize-image",     accent: "blue"    },
  { icon: Layers,    title: "Compress Image",   description: "Reduce file size.",            href: "/compress-image",   accent: "violet"  },
  { icon: RefreshCw, title: "Convert Image",    description: "Convert between formats.",     href: "/convert-image",    accent: "cyan"    },
  { icon: Eraser,    title: "Remove Background",description: "Remove image backgrounds.",   href: "/remove-background",accent: "emerald" },
];

const faqs = [
  { question: "How do I crop an image?", answer: "Upload your image, then drag on the image to draw your crop area. You can also pick an aspect ratio or a social media preset and it will auto-set the crop. Click Crop & Download when ready." },
  { question: "Can I enter exact pixel dimensions?", answer: "Yes. Use the Width and Height inputs below the image. The crop box updates live on the image." },
  { question: "What is 'Free' crop mode?", answer: "Free mode lets you draw any crop shape without an aspect ratio constraint." },
  { question: "Is it free?", answer: "Yes, completely free. No login required." },
  { question: "Will cropping reduce quality?", answer: "No — cropping removes pixels outside the selection. The remaining area is untouched." },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Convert a PixelCrop (relative to rendered image) to actual image pixel coords */
function toImagePixels(
  crop: PixelCrop,
  renderedW: number,
  renderedH: number,
  naturalW: number,
  naturalH: number
): { left: number; top: number; width: number; height: number } {
  const scaleX = naturalW / renderedW;
  const scaleY = naturalH / renderedH;
  return {
    left:   Math.round(crop.x      * scaleX),
    top:    Math.round(crop.y      * scaleY),
    width:  Math.round(crop.width  * scaleX),
    height: Math.round(crop.height * scaleY),
  };
}

/** Make a centered crop for a given aspect ratio */
function makeCentered(aspect: number | undefined, imgW: number, imgH: number): Crop {
  if (!aspect) {
    // Default: 80% of image
    return {
      unit: "%",
      x: 10, y: 10,
      width: 80, height: 80,
    };
  }
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 80 }, aspect, imgW, imgH),
    imgW,
    imgH
  );
}

// ── Page Component ───────────────────────────────────────────────────────────

export default function CropImagePage() {
  const sessionId = useSession();

  // Upload
  const [uploadedFile, setUploadedFile]     = useState<UploadedFile | null>(null);
  const imgRef                              = useRef<HTMLImageElement | null>(null);

  // ReactCrop state
  const [crop, setCrop]                     = useState<Crop>();
  const [completedCrop, setCompletedCrop]   = useState<PixelCrop>();
  const [aspect, setAspect]                 = useState<number | undefined>(undefined);
  const [selectedRatio, setSelectedRatio]   = useState("Free");

  // Manual pixel inputs (reflect actual image coords, not rendered coords)
  const [manualW, setManualW] = useState("");
  const [manualH, setManualH] = useState("");

  // Result blob URL for in-page preview
  const [resultPreview, setResultPreview]   = useState<string | null>(null);
  const [resultBytes, setResultBytes]       = useState<number | null>(null);

  const { state, error, process, reset }    = useImageProcessor({
    apiRoute: "/api/crop",
    sessionId,
    outputFileName: "cropped.jpeg",
  });

  const isProcessing = state === "uploading" || state === "processing";

  // ── On image load: set initial centered crop ────────────────────────────

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight, width, height } = e.currentTarget;
    imgRef.current = e.currentTarget;

    const initialCrop = makeCentered(aspect, width, height);
    setCrop(initialCrop);

    // Sync manual inputs
    const px = convertToPixelCrop(initialCrop, width, height);
    const coords = toImagePixels(px, width, height, naturalWidth, naturalHeight);
    setManualW(coords.width.toString());
    setManualH(coords.height.toString());
  }, [aspect]);

  // ── Sync manual inputs when crop changes ────────────────────────────────

  const onCropComplete = useCallback((pixelCrop: PixelCrop) => {
    setCompletedCrop(pixelCrop);
    const img = imgRef.current;
    if (!img) return;
    const coords = toImagePixels(
      pixelCrop, img.width, img.height,
      img.naturalWidth, img.naturalHeight
    );
    setManualW(coords.width.toString());
    setManualH(coords.height.toString());
  }, []);

  // ── Handle aspect ratio preset change ───────────────────────────────────

  const handleAspectChange = (label: string, val: number | undefined) => {
    setSelectedRatio(label);
    setAspect(val);
    const img = imgRef.current;
    if (!img) return;
    const newCrop = makeCentered(val, img.width, img.height);
    setCrop(newCrop);
    const px = convertToPixelCrop(newCrop, img.width, img.height);
    const coords = toImagePixels(px, img.width, img.height, img.naturalWidth, img.naturalHeight);
    setManualW(coords.width.toString());
    setManualH(coords.height.toString());
  };

  // ── Handle fixed size preset ────────────────────────────────────────────

  const handleFixedPreset = (presetW: number, presetH: number) => {
    const img = imgRef.current;
    if (!img) return;

    setSelectedRatio("Free");
    setAspect(undefined);

    // Clamp to image natural size
    const clampedW = Math.min(presetW, img.naturalWidth);
    const clampedH = Math.min(presetH, img.naturalHeight);

    // Center the crop on the image
    const scaleX = img.width / img.naturalWidth;
    const scaleY = img.height / img.naturalHeight;
    const renderedW = clampedW * scaleX;
    const renderedH = clampedH * scaleY;
    const x = (img.width  - renderedW) / 2;
    const y = (img.height - renderedH) / 2;

    const newCrop: Crop = {
      unit: "px",
      x, y,
      width:  renderedW,
      height: renderedH,
    };
    setCrop(newCrop);
    setManualW(clampedW.toString());
    setManualH(clampedH.toString());
  };

  // ── Handle manual pixel input → update crop overlay ─────────────────────

  const applyManualInputs = (w: string, h: string) => {
    const img = imgRef.current;
    if (!img) return;
    const nw = parseInt(w);
    const nh = parseInt(h);
    if (isNaN(nw) || isNaN(nh) || nw < 1 || nh < 1) return;

    const clampedW = Math.min(nw, img.naturalWidth);
    const clampedH = Math.min(nh, img.naturalHeight);

    const scaleX = img.width / img.naturalWidth;
    const scaleY = img.height / img.naturalHeight;
    const renderedW = clampedW * scaleX;
    const renderedH = clampedH * scaleY;
    const x = (img.width  - renderedW) / 2;
    const y = (img.height - renderedH) / 2;

    const newCrop: Crop = { unit: "px", x, y, width: renderedW, height: renderedH };
    setCrop(newCrop);
    setSelectedRatio("Free");
    setAspect(undefined);
  };

  // ── Crop & Download ──────────────────────────────────────────────────────

  const handleCrop = async () => {
    const img = imgRef.current;
    if (!img || !completedCrop || !uploadedFile) return;

    const coords = toImagePixels(
      completedCrop,
      img.width, img.height,
      img.naturalWidth, img.naturalHeight
    );

    if (coords.width < 1 || coords.height < 1) return;

    // We manually fetch so we can also create an in-page preview blob
    const formData = new FormData();
    formData.append("file", uploadedFile.file);
    formData.append("sessionId", sessionId);
    formData.append("left",   coords.left.toString());
    formData.append("top",    coords.top.toString());
    formData.append("width",  coords.width.toString());
    formData.append("height", coords.height.toString());
    formData.append("format", "jpeg");
    formData.append("quality", "90");

    // Use the existing hook for state tracking but also capture blob ourselves
    await process(uploadedFile.file, {
      left:    coords.left.toString(),
      top:     coords.top.toString(),
      width:   coords.width.toString(),
      height:  coords.height.toString(),
      format:  "jpeg",
      quality: "90",
    });
  };

  // Revoke old result preview on new upload
  useEffect(() => {
    return () => {
      if (resultPreview) URL.revokeObjectURL(resultPreview);
    };
  }, [resultPreview]);

  // ── Upload handler ───────────────────────────────────────────────────────

  const handleFileSelected = (f: UploadedFile) => {
    setUploadedFile(f);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setManualW("");
    setManualH("");
    setResultPreview(null);
    setResultBytes(null);
    reset();
  };

  // ── Derived values ───────────────────────────────────────────────────────

  const img = imgRef.current;
  let cropCoordsDisplay = "";
  if (completedCrop && img) {
    const c = toImagePixels(completedCrop, img.width, img.height, img.naturalWidth, img.naturalHeight);
    cropCoordsDisplay = `${c.width} × ${c.height} px`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <ToolPageTemplate
      title="Crop Image"
      description="Drag to crop your image precisely. Choose aspect ratios, social media presets, or enter exact pixel dimensions. Download the cropped result instantly."
      badge="Free Tool"
      uploadArea={<UploadDropzone onFileSelected={handleFileSelected} accept="image/png,image/jpeg,image/webp" />}
      settingsPanel={
        <div className="flex flex-col gap-4">

          {/* Aspect Ratio Presets */}
          <SettingsPanel title="Aspect Ratio" collapsible={false}>
            <div className="flex flex-wrap gap-2">
              {ASPECT_RATIOS.map((r) => (
                <button
                  key={r.label}
                  onClick={() => handleAspectChange(r.label, r.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                    selectedRatio === r.label
                      ? "brand-gradient text-white border-transparent"
                      : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground bg-muted/30"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </SettingsPanel>

          {/* Social Presets */}
          <SettingsPanel title="Social Presets" collapsible={true}>
            <div className="flex flex-col gap-1.5">
              {FIXED_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handleFixedPreset(p.width, p.height)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl border border-border text-sm bg-muted/20 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left"
                >
                  <span>{p.label}</span>
                  <span className="text-xs opacity-60">{p.width} × {p.height}</span>
                </button>
              ))}
            </div>
          </SettingsPanel>

          {/* Manual Dimensions */}
          <SettingsPanel title="Custom Size (px)" collapsible={true}>
            <div className="grid grid-cols-2 gap-3">
              <SettingRow label="Width">
                <Input
                  id="crop-manual-w"
                  type="number"
                  min={1}
                  value={manualW}
                  onChange={(e) => { setManualW(e.target.value); }}
                  onBlur={() => applyManualInputs(manualW, manualH)}
                  onKeyDown={(e) => e.key === "Enter" && applyManualInputs(manualW, manualH)}
                  className="rounded-xl h-9 text-sm"
                  placeholder="px"
                />
              </SettingRow>
              <SettingRow label="Height">
                <Input
                  id="crop-manual-h"
                  type="number"
                  min={1}
                  value={manualH}
                  onChange={(e) => { setManualH(e.target.value); }}
                  onBlur={() => applyManualInputs(manualW, manualH)}
                  onKeyDown={(e) => e.key === "Enter" && applyManualInputs(manualW, manualH)}
                  className="rounded-xl h-9 text-sm"
                  placeholder="px"
                />
              </SettingRow>
            </div>
            <p className="text-xs text-muted-foreground">Press Enter or click outside to apply.</p>
          </SettingsPanel>

          {/* Crop & Download Button */}
          <Button
            id="crop-process-btn"
            className="w-full brand-gradient text-white font-semibold h-11 rounded-xl hover:opacity-90 transition-opacity"
            onClick={handleCrop}
            disabled={!uploadedFile || !completedCrop || isProcessing}
          >
            {isProcessing ? (
              <><Loader2 size={16} className="mr-2 animate-spin" /> Processing…</>
            ) : (
              <><Scissors size={16} className="mr-2" /> Crop &amp; Download</>
            )}
          </Button>

          {/* Status */}
          {state === "done" && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl px-3 py-2">
              <CheckCircle2 size={14} /> Download started.
            </div>
          )}
          {state === "error" && error && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </div>
      }
      previewSection={
        uploadedFile ? (
          <div className="rounded-2xl border border-border bg-muted/10 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Drag to crop
              </span>
              {cropCoordsDisplay && (
                <span className="text-xs text-muted-foreground">
                  Selection: {cropCoordsDisplay}
                </span>
              )}
            </div>

            {/* Crop canvas */}
            <div className="flex items-center justify-center p-4 bg-muted/20 min-h-[300px]">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => onCropComplete(c)}
                aspect={aspect}
                minWidth={10}
                minHeight={10}
                ruleOfThirds
                className="max-w-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={uploadedFile.preview}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  style={{ maxWidth: "100%", maxHeight: "60vh", display: "block" }}
                />
              </ReactCrop>
            </div>

            {/* Image info footer */}
            <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Original: {uploadedFile.width} × {uploadedFile.height} px
              </span>
              <span>
                {uploadedFile.file.type.replace("image/", "").toUpperCase()} · {(uploadedFile.file.size / 1024).toFixed(0)} KB
              </span>
            </div>
          </div>
        ) : undefined
      }
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
