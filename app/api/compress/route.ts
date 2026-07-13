import { NextRequest, NextResponse } from "next/server";
import { compressImage, ImageFormat } from "@/server/image-engine/sharp-pipeline";
import { uploadToImageKit, deleteFile } from "@/server/image-engine/imagekit";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  let inputFileId: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const sessionId = formData.get("sessionId") as string;

    if (!file || !sessionId) {
      return NextResponse.json({ error: "file and sessionId are required" }, { status: 400 });
    }

    const quality = parseInt((formData.get("quality") as string) || "80");
    const inputBuffer = Buffer.from(await file.arrayBuffer());

    // Detect format from file
    const meta = await sharp(inputBuffer).metadata();
    const format = (meta.format as ImageFormat) || "jpeg";

    // Upload original to ImageKit session
    const uploaded = await uploadToImageKit(inputBuffer, file.name, sessionId);
    inputFileId = uploaded.fileId;

    // Compress
    const outputBuffer = await compressImage(inputBuffer, { quality, format });

    // Clean up temp file
    if (inputFileId) deleteFile(inputFileId).catch(() => {});

    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        "Content-Type": `image/${format}`,
        "Content-Disposition": `attachment; filename="compressed.${format}"`,
        "Content-Length": outputBuffer.byteLength.toString(),
      },
    });
  } catch (err) {
    console.error("[API /compress]", err);
    if (inputFileId) deleteFile(inputFileId).catch(() => {});
    return NextResponse.json({ error: "Compress failed" }, { status: 500 });
  }
}
