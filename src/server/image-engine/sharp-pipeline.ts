import sharp, { type Sharp } from "sharp";

export type ImageFormat = "jpeg" | "png" | "webp" | "avif" | "gif";

// ─────────────────────────────────────────────
// Resize
// ─────────────────────────────────────────────

export interface ResizeOptions {
  width?: number;
  height?: number;
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
  withoutEnlargement?: boolean;
  format?: ImageFormat;
  quality?: number;
}

export async function resizeImage(
  input: Buffer,
  options: ResizeOptions
): Promise<Buffer> {
  const pipeline = sharp(input).resize({
    width: options.width,
    height: options.height,
    fit: options.fit ?? "inside",
    withoutEnlargement: options.withoutEnlargement ?? true,
  });

  return applyFormat(pipeline, options.format ?? "jpeg", options.quality ?? 90);
}

// ─────────────────────────────────────────────
// Compress
// ─────────────────────────────────────────────

export interface CompressOptions {
  quality: number; // 1-100
  format?: ImageFormat;
}

export async function compressImage(
  input: Buffer,
  options: CompressOptions
): Promise<Buffer> {
  const meta = await sharp(input).metadata();
  const fmt = (options.format ?? meta.format ?? "jpeg") as ImageFormat;
  const pipeline = sharp(input);
  return applyFormat(pipeline, fmt, options.quality);
}

// ─────────────────────────────────────────────
// Convert Format
// ─────────────────────────────────────────────

export interface ConvertOptions {
  format: ImageFormat;
  quality?: number;
}

export async function convertFormat(
  input: Buffer,
  options: ConvertOptions
): Promise<Buffer> {
  const pipeline = sharp(input);
  return applyFormat(pipeline, options.format, options.quality ?? 90);
}

// ─────────────────────────────────────────────
// Crop
// ─────────────────────────────────────────────

export interface CropOptions {
  left: number;
  top: number;
  width: number;
  height: number;
  format?: ImageFormat;
  quality?: number;
}

export async function cropImage(
  input: Buffer,
  options: CropOptions
): Promise<Buffer> {
  const pipeline = sharp(input).extract({
    left: options.left,
    top: options.top,
    width: options.width,
    height: options.height,
  });
  return applyFormat(pipeline, options.format ?? "jpeg", options.quality ?? 90);
}

// ─────────────────────────────────────────────
// Watermark (text or image overlay)
// ─────────────────────────────────────────────

export type WatermarkType = "text" | "image";

export interface WatermarkOptions {
  // Shared
  type?: WatermarkType;       // default: "text"
  opacity?: number;           // 0–1
  position?:
    | "top-left" | "top-center" | "top-right"
    | "center"
    | "bottom-left" | "bottom-center" | "bottom-right";
  xPercent?: number;          // 0–100, overrides named position when set
  yPercent?: number;          // 0–100, overrides named position when set
  format?: ImageFormat;
  quality?: number;

  // Text-specific
  text?: string;
  fontSize?: number;          // absolute px; omit to auto-derive
  fontSizeKey?: "sm" | "md" | "lg"; // convenience alias
  fontWeight?: string;        // "400" | "600" | "700"
  fontColor?: string;         // hex e.g. "#ffffff"

  // Image-specific
  watermarkBuffer?: Buffer;   // the logo/image to composite
  scale?: number;             // 0–1, fraction of main image width; default 0.25
}

export async function watermarkImage(
  input: Buffer,
  options: WatermarkOptions
): Promise<Buffer> {
  const meta = await sharp(input).metadata();
  const { width = 800, height = 600 } = meta;
  const opacity = Math.min(1, Math.max(0, options.opacity ?? 0.5));
  const type = options.type ?? "text";

  if (type === "image" && options.watermarkBuffer) {
    return watermarkImageLogo(input, options.watermarkBuffer, {
      width,
      height,
      opacity,
      xPercent: options.xPercent,
      yPercent: options.yPercent,
      position: options.position ?? "bottom-right",
      scale: options.scale ?? 0.25,
      format: options.format ?? "jpeg",
      quality: options.quality ?? 90,
    });
  }

  // ── Text watermark ──
  const text = options.text || "editimage.online";

  // Resolve font size
  let fontSize: number;
  if (options.fontSize) {
    fontSize = options.fontSize;
  } else {
    const key = options.fontSizeKey ?? "md";
    const factor = key === "sm" ? 0.025 : key === "lg" ? 0.06 : 0.04;
    fontSize = Math.max(14, Math.round(width * factor));
  }

  const fontWeight = options.fontWeight ?? "700";
  const fontColor = options.fontColor ?? "#ffffff";
  const strokeColor = fontColor === "#ffffff" || fontColor === "white"
    ? `rgba(0,0,0,${opacity * 0.5})`
    : `rgba(255,255,255,${opacity * 0.3})`;

  // Resolve position to SVG coordinates
  const { x, y, anchor } = resolveTextPosition(
    options.xPercent,
    options.yPercent,
    options.position ?? "bottom-right",
    width,
    height,
    fontSize
  );

  const escapeXml = (unsafe: string) => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
  };

  const svgText = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .wm {
      font-family: Arial, Helvetica, sans-serif;
      font-size: ${fontSize}px;
      font-weight: ${fontWeight};
      fill: ${fontColor};
      fill-opacity: ${opacity};
      paint-order: stroke;
      stroke: ${strokeColor};
      stroke-width: 2px;
    }
  </style>
  <text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle" class="wm">${escapeXml(text)}</text>
</svg>`;

  const svgBuffer = Buffer.from(svgText);
  const pipeline = sharp(input).composite([{ input: svgBuffer, top: 0, left: 0 }]);
  return applyFormat(pipeline, options.format ?? "jpeg", options.quality ?? 90);
}

// ── Resolve text anchor coordinates ──
function resolveTextPosition(
  xPercent: number | undefined,
  yPercent: number | undefined,
  position: string,
  w: number,
  h: number,
  fontSize: number
): { x: number; y: number; anchor: string } {
  const pad = Math.round(fontSize * 1.2);

  // If explicit percentages provided, use them
  if (xPercent !== undefined && yPercent !== undefined) {
    const px = Math.round((xPercent / 100) * w);
    const py = Math.round((yPercent / 100) * h);
    // Determine anchor based on horizontal position
    const anchor = xPercent < 33 ? "start" : xPercent > 67 ? "end" : "middle";
    return { x: px, y: py, anchor };
  }

  // Fall back to named position
  let x: number;
  let y: number;
  let anchor: string;

  if (position.includes("left")) { x = pad; anchor = "start"; }
  else if (position.includes("right")) { x = w - pad; anchor = "end"; }
  else { x = Math.round(w / 2); anchor = "middle"; }

  if (position.includes("top")) y = pad + fontSize;
  else if (position.includes("bottom")) y = h - pad;
  else y = Math.round(h / 2);

  return { x, y, anchor };
}

// ── Image / logo watermark ──
async function watermarkImageLogo(
  input: Buffer,
  logoBuffer: Buffer,
  opts: {
    width: number;
    height: number;
    opacity: number;
    xPercent?: number;
    yPercent?: number;
    position: string;
    scale: number;
    format: ImageFormat;
    quality: number;
  }
): Promise<Buffer> {
  const { width, height, opacity, scale, format, quality } = opts;

  // Resize logo to target width and extract raw RGBA pixels
  const logoTargetWidth = Math.max(20, Math.round(width * scale));
  const { data, info } = await sharp(logoBuffer)
    .resize({ width: logoTargetWidth, withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const logoW = info.width;
  const logoH = info.height;

  // Apply opacity directly to the alpha channel
  if (opacity < 1) {
    for (let i = 3; i < data.length; i += 4) {
      data[i] = Math.round(data[i] * opacity);
    }
  }

  // Convert modified raw pixels back to a format suitable for compositing
  const opacifiedLogo = await sharp(data, {
    raw: { width: logoW, height: logoH, channels: 4 }
  }).png().toBuffer();

  // Calculate top-left pixel position
  const { left, top } = resolveImagePosition(
    opts.xPercent,
    opts.yPercent,
    opts.position,
    width,
    height,
    logoW,
    logoH
  );

  const pipeline = sharp(input).composite([{
    input: opacifiedLogo,
    top: Math.max(0, top),
    left: Math.max(0, left),
    blend: "over",
  }]);

  return applyFormat(pipeline, format, quality);
}

function resolveImagePosition(
  xPercent: number | undefined,
  yPercent: number | undefined,
  position: string,
  imgW: number,
  imgH: number,
  logoW: number,
  logoH: number
): { left: number; top: number } {
  const pad = 16;

  if (xPercent !== undefined && yPercent !== undefined) {
    // xPercent/yPercent is center of watermark
    const cx = Math.round((xPercent / 100) * imgW);
    const cy = Math.round((yPercent / 100) * imgH);
    return {
      left: Math.min(imgW - logoW, Math.max(0, cx - Math.round(logoW / 2))),
      top: Math.min(imgH - logoH, Math.max(0, cy - Math.round(logoH / 2))),
    };
  }

  let left: number;
  let top: number;

  if (position.includes("left")) left = pad;
  else if (position.includes("right")) left = imgW - logoW - pad;
  else left = Math.round((imgW - logoW) / 2);

  if (position.includes("top")) top = pad;
  else if (position.includes("bottom")) top = imgH - logoH - pad;
  else top = Math.round((imgH - logoH) / 2);

  return { left, top };
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ─────────────────────────────────────────────
// Image Editor (brightness, contrast, blur, etc.)
// ─────────────────────────────────────────────

export interface EditorOptions {
  brightness?: number;  // 0-2 (1 = no change)
  saturation?: number;  // 0-2 (1 = no change)
  hue?: number;         // degrees -180 to 180
  blur?: number;        // sigma 0-20
  sharpen?: boolean;
  grayscale?: boolean;
  sepia?: boolean;
  invert?: boolean;
  format?: ImageFormat;
  quality?: number;
}

export async function editImage(
  input: Buffer,
  options: EditorOptions
): Promise<Buffer> {
  let pipeline = sharp(input);

  if (options.grayscale) pipeline = pipeline.grayscale();
  if (options.invert) pipeline = pipeline.negate();

  if (options.brightness !== undefined || options.saturation !== undefined || options.hue !== undefined) {
    pipeline = pipeline.modulate({
      brightness: options.brightness ?? 1,
      saturation: options.saturation ?? 1,
      hue: options.hue ?? 0,
    });
  }

  if (options.blur && options.blur > 0) {
    pipeline = pipeline.blur(options.blur);
  }

  if (options.sharpen) {
    pipeline = pipeline.sharpen();
  }

  if (options.sepia) {
    // Apply a warm sepia tone via tinting
    pipeline = pipeline.tint({ r: 112, g: 66, b: 20 });
  }

  return applyFormat(pipeline, options.format ?? "jpeg", options.quality ?? 90);
}

// ─────────────────────────────────────────────
// Shared: apply output format
// ─────────────────────────────────────────────

function applyFormat(
  pipeline: Sharp,
  format: ImageFormat,
  quality: number
): Promise<Buffer> {
  switch (format) {
    case "png":
      return pipeline.png({ quality }).toBuffer();
    case "webp":
      return pipeline.webp({ quality }).toBuffer();
    case "avif":
      return pipeline.avif({ quality }).toBuffer();
    case "gif":
      return pipeline.gif().toBuffer();
    case "jpeg":
    default:
      return pipeline.jpeg({ quality }).toBuffer();
  }
}

// ─────────────────────────────────────────────
// Metadata extraction
// ─────────────────────────────────────────────

export interface ImageMeta {
  width: number;
  height: number;
  format: string;
  size: number;
}

export async function getImageMeta(input: Buffer): Promise<ImageMeta> {
  const meta = await sharp(input).metadata();
  return {
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    format: meta.format ?? "unknown",
    size: meta.size ?? input.byteLength,
  };
}
