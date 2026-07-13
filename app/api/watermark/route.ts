import { NextRequest, NextResponse } from "next/server";
import { watermarkImage, ImageFormat } from "@/server/image-engine/sharp-pipeline";
import { uploadToImageKit, deleteFile } from "@/server/image-engine/imagekit";

export async function POST(req: NextRequest) {
  let inputFileId: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const sessionId = formData.get("sessionId") as string;

    if (!file || !sessionId) {
      return NextResponse.json({ error: "file and sessionId are required" }, { status: 400 });
    }

    // ── Shared params ──
    const type = ((formData.get("type") as string) || "text") as "text" | "image";
    const opacity = parseFloat((formData.get("opacity") as string) || "0.5");
    const position = (formData.get("position") as string) || "bottom-right";
    const format = (formData.get("format") as ImageFormat) || "jpeg";
    const quality = parseInt((formData.get("quality") as string) || "90");

    // xPercent / yPercent (optional — replaces named position when present)
    const xPercentRaw = formData.get("xPercent") as string | null;
    const yPercentRaw = formData.get("yPercent") as string | null;
    const xPercent = xPercentRaw !== null ? parseFloat(xPercentRaw) : undefined;
    const yPercent = yPercentRaw !== null ? parseFloat(yPercentRaw) : undefined;

    // ── Text-specific ──
    const text = (formData.get("text") as string) || "editimage.online";
    const fontSizeKey = ((formData.get("fontSizeKey") as string) || "md") as "sm" | "md" | "lg";
    const fontWeight = (formData.get("fontWeight") as string) || "700";
    const fontColor = (formData.get("fontColor") as string) || "#ffffff";

    // ── Image-specific ──
    const watermarkFile = formData.get("watermarkFile") as File | null;
    const scale = parseFloat((formData.get("scale") as string) || "0.25");

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadToImageKit(inputBuffer, file.name, sessionId);
    inputFileId = uploaded.fileId;

    let watermarkBuffer: Buffer | undefined;
    if (type === "image" && watermarkFile) {
      watermarkBuffer = Buffer.from(await watermarkFile.arrayBuffer());
      console.log("[API /watermark] watermarkBuffer length:", watermarkBuffer.length, "type:", typeof watermarkFile, "name:", watermarkFile.name);
      const fs = require('fs');
      fs.appendFileSync('watermark-error.log', `[API /watermark] watermarkBuffer length: ${watermarkBuffer.length}\n`);
    }

    let outputBuffer: Buffer;
    try {
      outputBuffer = await watermarkImage(inputBuffer, {
        type,
        opacity: Math.min(1, Math.max(0, opacity)),
        position: position as any,
        xPercent,
        yPercent,
        format,
        quality,
        // Text
        text,
        fontSizeKey,
        fontWeight,
        fontColor,
        // Image
        watermarkBuffer,
        scale,
      });
    } catch (wmErr: any) {
      if (wmErr.message?.includes("unsupported image format")) {
        if (inputFileId) deleteFile(inputFileId).catch(() => {});
        return NextResponse.json({ error: "Unsupported logo format. Please use a valid PNG or JPEG image." }, { status: 400 });
      }
      throw wmErr;
    }

    if (inputFileId) deleteFile(inputFileId).catch(() => {});

    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        "Content-Type": `image/${format}`,
        "Content-Disposition": `attachment; filename="watermarked.${format}"`,
        "Content-Length": outputBuffer.byteLength.toString(),
      },
    });
  } catch (err) {
    const fs = require('fs');
    fs.appendFileSync('watermark-error.log', err.stack + "\n");
    console.error("[API /watermark]", err);
    if (inputFileId) deleteFile(inputFileId).catch(() => {});
    return NextResponse.json({ error: "Watermark failed" }, { status: 500 });
  }
}
