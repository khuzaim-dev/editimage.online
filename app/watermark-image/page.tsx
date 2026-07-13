"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  ChangeEvent,
} from "react";
import { ToolPageTemplate } from "@/components/ToolPageTemplate";
import { UploadDropzone, UploadedFile } from "@/components/UploadDropzone";
import { SettingsPanel, SettingRow } from "@/components/SettingsPanel";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Minimize2,
  Layers,
  Eraser,
  RefreshCw,
  Stamp,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Type,
  ImageIcon,
  Upload,
  GripHorizontal,
} from "lucide-react";
import { useSession } from "@/shared/hooks/useSession";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const POSITIONS = [
  { value: "top-left",     label: "↖",  xPct: 5,  yPct: 5  },
  { value: "top-center",   label: "↑",  xPct: 50, yPct: 5  },
  { value: "top-right",    label: "↗",  xPct: 95, yPct: 5  },
  { value: "center",       label: "⊕",  xPct: 50, yPct: 50 },
  { value: "bottom-left",  label: "↙",  xPct: 5,  yPct: 95 },
  { value: "bottom-center",label: "↓",  xPct: 50, yPct: 95 },
  { value: "bottom-right", label: "↘",  xPct: 95, yPct: 95 },
];

const COLOR_PRESETS = [
  { label: "White",  value: "#ffffff" },
  { label: "Black",  value: "#000000" },
  { label: "Gray",   value: "#9ca3af" },
  { label: "Red",    value: "#ef4444" },
  { label: "Blue",   value: "#3b82f6" },
];

const FONT_SIZES = [
  { key: "sm", label: "Sm" },
  { key: "md", label: "Md" },
  { key: "lg", label: "Lg" },
] as const;

type FontSizeKey = "sm" | "md" | "lg";

const FONT_WEIGHTS = [
  { value: "400", label: "Normal" },
  { value: "600", label: "Semi" },
  { value: "700", label: "Bold" },
];

const relatedTools = [
  { icon: Minimize2, title: "Resize Image",       description: "Change image dimensions.",   href: "/resize-image",      accent: "blue"    },
  { icon: Layers,    title: "Compress Image",      description: "Reduce file size.",          href: "/compress-image",    accent: "violet"  },
  { icon: Eraser,    title: "Remove Background",   description: "Remove image backgrounds.",  href: "/remove-background", accent: "emerald" },
  { icon: RefreshCw, title: "Convert Image",       description: "Convert between formats.",   href: "/convert-image",     accent: "cyan"    },
];

const faqs = [
  { question: "How do I add a watermark?",          answer: "Upload your image, type your watermark text (or upload a logo), choose position and opacity, then click Add Watermark to download." },
  { question: "Can I drag the watermark?",          answer: "Yes! Click and drag the watermark text directly on the preview image to position it precisely." },
  { question: "Can I use a logo as watermark?",     answer: "Yes. Switch to Image mode, upload your logo (PNG with transparency works best), adjust scale and opacity." },
  { question: "Does the preview match the download?", answer: "Yes. Position, opacity, font size, weight, and color are all preserved exactly in the downloaded file." },
  { question: "Will the watermark reduce quality?", answer: "No. The watermark is composited as an SVG or image layer using Sharp, preserving the underlying image quality." },
];

// ─────────────────────────────────────────────
// Helper: compute font-size in px for preview
// ─────────────────────────────────────────────
function computeFontSizePx(key: FontSizeKey, imageWidth: number): number {
  const factor = key === "sm" ? 0.025 : key === "lg" ? 0.06 : 0.04;
  return Math.max(14, Math.round(imageWidth * factor));
}

// ─────────────────────────────────────────────
// Preview Component
// ─────────────────────────────────────────────

interface WatermarkPreviewProps {
  mainImage: UploadedFile;
  type: "text" | "image";
  // text
  text: string;
  fontSizeKey: FontSizeKey;
  fontWeight: string;
  fontColor: string;
  opacity: number; // 0-100
  // image
  watermarkImageSrc: string | null;
  logoScale: number; // 0-100
  // position
  dragPos: { xPct: number; yPct: number };
  onDragPosChange: (pos: { xPct: number; yPct: number }) => void;
}

function WatermarkPreview({
  mainImage,
  type,
  text,
  fontSizeKey,
  fontWeight,
  fontColor,
  opacity,
  watermarkImageSrc,
  logoScale,
  dragPos,
  onDragPosChange,
}: WatermarkPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startMouse = useRef({ x: 0, y: 0 });
  const startPct = useRef({ xPct: 0, yPct: 0 });

  // Track the rendered image rect (accounts for object-contain letterboxing)
  const [imgRect, setImgRect] = useState<{
    left: number; top: number; width: number; height: number;
  } | null>(null);

  const updateImgRect = useCallback(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) return;

    const containerW = container.clientWidth;
    const containerH = container.clientHeight;
    const imgNatW = mainImage.width ?? img.naturalWidth ?? 1;
    const imgNatH = mainImage.height ?? img.naturalHeight ?? 1;

    const containerRatio = containerW / containerH;
    const imgRatio = imgNatW / imgNatH;

    let rendW: number, rendH: number;
    if (imgRatio > containerRatio) {
      rendW = containerW;
      rendH = containerW / imgRatio;
    } else {
      rendH = containerH;
      rendW = containerH * imgRatio;
    }

    setImgRect({
      left: (containerW - rendW) / 2,
      top:  (containerH - rendH) / 2,
      width: rendW,
      height: rendH,
    });
  }, [mainImage.width, mainImage.height]);

  useEffect(() => {
    updateImgRect();
    const ro = new ResizeObserver(updateImgRect);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [updateImgRect]);

  // ── Drag handlers ──
  /**
   * Clamp xPct/yPct so the watermark center always stays within the
   * rendered image area. Works entirely in pixel space so it is reliable
   * even before the watermark element has been measured by the browser.
   */
  const clampPos = useCallback(
    (xPct: number, yPct: number): { xPct: number; yPct: number } => {
      if (!imgRect) return { xPct, yPct };

      // Measure the watermark element if available; fall back to ~8% of image
      const el = watermarkRef.current;
      const elW = (el?.offsetWidth  ?? 0) || imgRect.width  * 0.08;
      const elH = (el?.offsetHeight ?? 0) || imgRect.height * 0.08;

      // Center in pixel coords relative to image top-left
      const cx = (xPct / 100) * imgRect.width;
      const cy = (yPct / 100) * imgRect.height;

      // Keep the full element inside image bounds
      const clampedCx = Math.min(imgRect.width  - elW / 2, Math.max(elW / 2, cx));
      const clampedCy = Math.min(imgRect.height - elH / 2, Math.max(elH / 2, cy));

      return {
        xPct: (clampedCx / imgRect.width)  * 100,
        yPct: (clampedCy / imgRect.height) * 100,
      };
    },
    [imgRect]
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      startMouse.current = { x: e.clientX, y: e.clientY };
      startPct.current = { xPct: dragPos.xPct, yPct: dragPos.yPct };

      const onMove = (mv: MouseEvent) => {
        if (!dragging.current || !imgRect) return;
        const dx = mv.clientX - startMouse.current.x;
        const dy = mv.clientY - startMouse.current.y;
        const dxPct = (dx / imgRect.width)  * 100;
        const dyPct = (dy / imgRect.height) * 100;
        const clamped = clampPos(
          startPct.current.xPct + dxPct,
          startPct.current.yPct + dyPct
        );
        onDragPosChange(clamped);
      };

      const onUp = () => {
        dragging.current = false;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [dragPos.xPct, dragPos.yPct, imgRect, clampPos, onDragPosChange]
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      dragging.current = true;
      startMouse.current = { x: touch.clientX, y: touch.clientY };
      startPct.current = { xPct: dragPos.xPct, yPct: dragPos.yPct };

      const onMove = (mv: TouchEvent) => {
        if (!dragging.current || !imgRect) return;
        const t = mv.touches[0];
        const dx = t.clientX - startMouse.current.x;
        const dy = t.clientY - startMouse.current.y;
        const dxPct = (dx / imgRect.width)  * 100;
        const dyPct = (dy / imgRect.height) * 100;
        const clamped = clampPos(
          startPct.current.xPct + dxPct,
          startPct.current.yPct + dyPct
        );
        onDragPosChange(clamped);
      };
      const onEnd = () => {
        dragging.current = false;
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("touchend", onEnd);
      };

      window.addEventListener("touchmove", onMove, { passive: true });
      window.addEventListener("touchend", onEnd);
    },
    [dragPos.xPct, dragPos.yPct, imgRect, clampPos, onDragPosChange]
  );

  // ── Watermark visual position relative to container ──
  const wmLeft = imgRect ? imgRect.left + (dragPos.xPct / 100) * imgRect.width : 0;
  const wmTop  = imgRect ? imgRect.top  + (dragPos.yPct / 100) * imgRect.height : 0;

  // ── Font size in preview (proportional to rendered image width) ──
  const previewFontSizePx = imgRect
    ? computeFontSizePx(fontSizeKey, imgRect.width)
    : 16;

  // ── Logo width in preview ──
  const previewLogoWidth = imgRect ? Math.round(imgRect.width * (logoScale / 100)) : 80;

  return (
    <div className="rounded-2xl border border-border bg-muted/10 overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Live Preview
        </span>
        <span className="text-xs text-muted-foreground/60">· drag watermark to reposition</span>
      </div>

      {/* Image container — overflow hidden is the CSS safety net for boundary clamping */}
      <div
        ref={containerRef}
        className="relative bg-muted/30 select-none overflow-hidden"
        style={{ height: 380 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={mainImage.preview}
          alt="Preview"
          onLoad={updateImgRect}
          draggable={false}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />

        {/* Watermark overlay — positioned at computed pixel coords */}
        {imgRect && (
          <div
            ref={watermarkRef}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            style={{
              position: "absolute",
              left: wmLeft,
              top: wmTop,
              transform: "translate(-50%, -50%)",
              cursor: "grab",
              userSelect: "none",
              opacity: opacity / 100,
              zIndex: 10,
            }}
          >
            {type === "text" ? (
              <span
                style={{
                  fontSize: previewFontSizePx,
                  fontWeight,
                  color: fontColor,
                  fontFamily: "Arial, Helvetica, sans-serif",
                  textShadow:
                    fontColor === "#ffffff" || fontColor === "white"
                      ? "0 1px 3px rgba(0,0,0,0.7)"
                      : "0 1px 3px rgba(255,255,255,0.4)",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <GripHorizontal size={12} style={{ opacity: 0.5, flexShrink: 0 }} />
                {text || "editimage.online"}
              </span>
            ) : watermarkImageSrc ? (
              <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                <GripHorizontal
                  size={12}
                  style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", opacity: 0.5, color: "#fff" }}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={watermarkImageSrc}
                  alt="Logo watermark"
                  draggable={false}
                  style={{ width: previewLogoWidth, height: "auto", display: "block" }}
                />
              </div>
            ) : (
              <span style={{ fontSize: 12, color: "#9ca3af" }}>Upload a logo image</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

export default function WatermarkImagePage() {
  const sessionId = useSession();
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  // ── Watermark type ──
  const [wmType, setWmType] = useState<"text" | "image">("text");

  // ── Text controls ──
  const [text, setText] = useState("editimage.online");
  const [fontSizeKey, setFontSizeKey] = useState<FontSizeKey>("md");
  const [fontWeight, setFontWeight] = useState("700");
  const [fontColor, setFontColor] = useState("#ffffff");

  // ── Image/logo controls ──
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
  const [watermarkImageSrc, setWatermarkImageSrc] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState([25]); // percentage of image width

  // ── Shared controls ──
  const [opacity, setOpacity] = useState([70]);
  const [activePosition, setActivePosition] = useState("bottom-right");
  const [dragPos, setDragPos] = useState<{ xPct: number; yPct: number }>({ xPct: 95, yPct: 95 });

  const logoInputRef = useRef<HTMLInputElement>(null);

  // ── Local processing state ──
  const [procState, setProcState] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [procError, setProcError] = useState<string | null>(null);
  const [procResultSize, setProcResultSize] = useState<number | null>(null);

  const isProcessing = procState === "processing";

  // ── Position button handler ──
  const handlePositionClick = (pos: typeof POSITIONS[number]) => {
    setActivePosition(pos.value);
    setDragPos({ xPct: pos.xPct, yPct: pos.yPct });
    // Reset done state when user changes settings
    if (procState === "done") setProcState("idle");
  };

  // ── Drag handler — clears active named position ──
  const handleDragPosChange = useCallback((pos: { xPct: number; yPct: number }) => {
    setDragPos(pos);
    // Find if this closely matches a preset position
    const match = POSITIONS.find(
      (p) => Math.abs(p.xPct - pos.xPct) < 3 && Math.abs(p.yPct - pos.yPct) < 3
    );
    setActivePosition(match?.value ?? "");
  }, []);

  // ── Logo upload ──
  const handleLogoFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const src = URL.createObjectURL(file);
    setWatermarkFile(file);
    setWatermarkImageSrc(src);
  };

  // ── Helpers ──
  /** Derive output format from the uploaded file's MIME type */
  const getOutputFormat = (file: File): { format: string; ext: string; mimeType: string } => {
    const mime = file.type.toLowerCase();
    if (mime === "image/png")  return { format: "png",  ext: "png",  mimeType: "image/png" };
    if (mime === "image/webp") return { format: "webp", ext: "webp", mimeType: "image/webp" };
    if (mime === "image/gif")  return { format: "gif",  ext: "gif",  mimeType: "image/gif" };
    if (mime === "image/avif") return { format: "avif", ext: "avif", mimeType: "image/avif" };
    return { format: "jpeg", ext: "jpg", mimeType: "image/jpeg" };
  };

  // ── Process ──
  const handleProcess = () => {
    if (!uploadedFile) return;

    const { format, ext, mimeType } = getOutputFormat(uploadedFile.file);

    const params: Record<string, string> = {
      type: wmType,
      opacity: (opacity[0] / 100).toString(),
      position: activePosition || "bottom-right",
      xPercent: dragPos.xPct.toString(),
      yPercent: dragPos.yPct.toString(),
      format,
      // Text
      text,
      fontSizeKey,
      fontWeight,
      fontColor,
      // Logo
      scale: (logoScale[0] / 100).toString(),
    };

    const outputFileName = `watermarked.${ext}`;

    // Append watermark file separately if image type
    if (wmType === "image" && watermarkFile) {
      handleProcessWithLogo(uploadedFile.file, params, watermarkFile, outputFileName, mimeType);
    } else {
      processWithName(uploadedFile.file, params, outputFileName, mimeType);
    }
  };

  /** Wrapper that posts to watermark API and downloads result */
  const processWithName = async (
    file: File,
    params: Record<string, string>,
    fileName: string,
    mimeType: string
  ) => {
    setProcState("processing");
    setProcError(null);
    setProcResultSize(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sessionId", sessionId);
      Object.entries(params).forEach(([k, v]) => formData.append(k, v));

      const res = await fetch("/api/watermark", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const rawBlob = await res.blob();
      // Use File instead of Blob. Some browsers ignore a.download for generic blobs 
      // but will respect the internal filename of a File object.
      const fileObj = new File([rawBlob], fileName, { type: mimeType });
      setProcResultSize(fileObj.size);
      triggerDownload(fileObj, fileName);
      setProcState("done");
    } catch (err) {
      setProcError(err instanceof Error ? err.message : "Processing failed");
      setProcState("error");
    }
  };

  const handleProcessWithLogo = async (
    mainFile: File,
    params: Record<string, string>,
    logoFile: File,
    outputFileName: string,
    mimeType: string
  ) => {
    setProcState("processing");
    setProcError(null);
    setProcResultSize(null);
    try {
      const formData = new FormData();
      formData.append("file", mainFile);
      formData.append("sessionId", sessionId);
      formData.append("watermarkFile", logoFile);
      Object.entries(params).forEach(([k, v]) => formData.append(k, v));

      const res = await fetch("/api/watermark", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const rawBlob = await res.blob();
      const fileObj = new File([rawBlob], outputFileName, { type: mimeType });
      setProcResultSize(fileObj.size);
      triggerDownload(fileObj, outputFileName);
      setProcState("done");
    } catch (err) {
      setProcError(err instanceof Error ? err.message : "Processing failed");
      setProcState("error");
    }
  };

  const triggerDownload = (blob: Blob, fileName: string) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = fileName;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    reader.readAsDataURL(blob);
  };

  return (
    <ToolPageTemplate
      title="Watermark Image"
      description="Protect your images with custom text or logo watermarks. Drag to position, pick font, size, color, and opacity. Built with Sharp — fast and lossless."
      badge="Free Tool"
      uploadArea={
        <UploadDropzone onFileSelected={(f) => { setUploadedFile(f); setProcState("idle"); setProcError(null); setProcResultSize(null); }} />
      }
      settingsPanel={
        <SettingsPanel title="Watermark Settings">

          {/* ── Type toggle ── */}
          <SettingRow label="Watermark Type">
            <div className="grid grid-cols-2 gap-1.5">
              {([
                { value: "text",  label: "Text",  Icon: Type       },
                { value: "image", label: "Logo / Image", Icon: ImageIcon },
              ] as const).map(({ value, label, Icon }) => (
                <button
                  key={value}
                  onClick={() => setWmType(value)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border transition-all duration-150",
                    wmType === value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground"
                  )}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </SettingRow>

          {/* ── Text controls ── */}
          {wmType === "text" && (
            <>
              <SettingRow label="Watermark Text">
                <Input
                  id="watermark-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="rounded-xl h-10"
                  placeholder="Enter your text…"
                />
              </SettingRow>

              <SettingRow label="Font Size">
                <div className="grid grid-cols-3 gap-1.5">
                  {FONT_SIZES.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setFontSizeKey(s.key)}
                      className={cn(
                        "py-1.5 rounded-lg text-xs font-medium border transition-all duration-150",
                        fontSizeKey === s.key
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </SettingRow>

              <SettingRow label="Font Weight">
                <div className="grid grid-cols-3 gap-1.5">
                  {FONT_WEIGHTS.map((w) => (
                    <button
                      key={w.value}
                      onClick={() => setFontWeight(w.value)}
                      className={cn(
                        "py-1.5 rounded-lg text-xs font-medium border transition-all duration-150",
                        fontWeight === w.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground"
                      )}
                      style={{ fontWeight: parseInt(w.value) }}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </SettingRow>

              <SettingRow label="Text Color">
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c.value}
                      title={c.label}
                      onClick={() => setFontColor(c.value)}
                      className={cn(
                        "w-7 h-7 rounded-full border-2 transition-all duration-150 flex-shrink-0",
                        fontColor === c.value
                          ? "border-primary scale-110 ring-2 ring-primary/30"
                          : "border-border hover:border-primary/60"
                      )}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                  {/* Custom color picker — visible input, no sr-only so browser opens near the element */}
                  <div
                    title="Custom color"
                    className={cn(
                      "relative w-7 h-7 rounded-full border-2 cursor-pointer flex-shrink-0 overflow-hidden transition-all duration-150",
                      !COLOR_PRESETS.find((c) => c.value === fontColor)
                        ? "border-primary scale-110 ring-2 ring-primary/30"
                        : "border-border hover:border-primary/60"
                    )}
                    style={{
                      background: `conic-gradient(red, yellow, lime, cyan, blue, magenta, red)`,
                    }}
                  >
                    <input
                      type="color"
                      value={fontColor}
                      onChange={(e) => setFontColor(e.target.value)}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        opacity: 0,
                        cursor: "pointer",
                        padding: 0,
                        border: "none",
                      }}
                    />
                  </div>
                  {/* Hex value display */}
                  <span className="text-xs text-muted-foreground font-mono">{fontColor}</span>
                </div>
              </SettingRow>
            </>
          )}

          {/* ── Image/logo controls ── */}
          {wmType === "image" && (
            <>
              <SettingRow label="Logo / Image">
                <div
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border hover:border-primary/60 p-4 cursor-pointer transition-colors"
                  onClick={() => logoInputRef.current?.click()}
                >
                  {watermarkImageSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={watermarkImageSrc}
                      alt="Logo preview"
                      className="max-h-16 max-w-full object-contain rounded"
                    />
                  ) : (
                    <>
                      <Upload size={20} className="text-muted-foreground" />
                      <p className="text-xs text-muted-foreground text-center">
                        Click to upload logo<br />
                        <span className="opacity-60">PNG with transparency recommended</span>
                      </p>
                    </>
                  )}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleLogoFile}
                  />
                </div>
                {watermarkImageSrc && (
                  <button
                    onClick={() => { setWatermarkFile(null); setWatermarkImageSrc(null); }}
                    className="text-xs text-muted-foreground hover:text-destructive mt-1 transition-colors"
                  >
                    Remove logo
                  </button>
                )}
              </SettingRow>

              <SettingRow label={`Logo Scale — ${logoScale[0]}%`}>
                <Slider
                  id="logo-scale"
                  min={5}
                  max={80}
                  step={1}
                  value={logoScale}
                  onValueChange={(val) => setLogoScale(Array.isArray(val) ? [...(val as number[])] : [val as number])}
                  className="mt-1"
                />
              </SettingRow>
            </>
          )}

          {/* ── Opacity (shared) ── */}
          <SettingRow label={`Opacity — ${opacity[0]}%`}>
            <Slider
              id="watermark-opacity"
              min={10}
              max={100}
              step={1}
              value={opacity}
              onValueChange={(val) => setOpacity(Array.isArray(val) ? [...(val as number[])] : [val as number])}
              className="mt-1"
            />
          </SettingRow>

          {/* ── Position ── */}
          <SettingRow label="Position">
            <div className="grid grid-cols-3 gap-1.5">
              {POSITIONS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => handlePositionClick(p)}
                  className={cn(
                    "px-2 py-2 rounded-lg text-[13px] font-medium border transition-all duration-150 text-center",
                    activePosition === p.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground"
                  )}
                  title={p.value.replace(/-/g, " ")}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground/60 mt-1">
              Or drag the watermark directly on the preview
            </p>
          </SettingRow>

          {/* ── Process button ── */}
          <Button
            id="watermark-process-btn"
            className="w-full brand-gradient text-white font-semibold h-11 rounded-xl hover:opacity-90 transition-opacity mt-1"
            onClick={handleProcess}
            disabled={
              !uploadedFile ||
              isProcessing ||
              (wmType === "text" && !text.trim()) ||
              (wmType === "image" && !watermarkFile)
            }
          >
            {isProcessing ? (
              <><Loader2 size={16} className="mr-2 animate-spin" />Processing…</>
            ) : (
              <><Stamp size={16} className="mr-2" />Add Watermark</>
            )}
          </Button>

          {procState === "done" && procResultSize && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl px-3 py-2">
              <CheckCircle2 size={14} /> Done! {(procResultSize / 1024).toFixed(0)} KB — download started.
            </div>
          )}
          {procState === "error" && procError && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2">
              <AlertCircle size={14} /> {procError}
            </div>
          )}
        </SettingsPanel>
      }
      previewSection={
        uploadedFile ? (
          <WatermarkPreview
            mainImage={uploadedFile}
            type={wmType}
            text={text}
            fontSizeKey={fontSizeKey}
            fontWeight={fontWeight}
            fontColor={fontColor}
            opacity={opacity[0]}
            watermarkImageSrc={watermarkImageSrc}
            logoScale={logoScale[0]}
            dragPos={dragPos}
            onDragPosChange={handleDragPosChange}
          />
        ) : undefined
      }
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
