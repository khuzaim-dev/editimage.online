import { NextRequest, NextResponse } from "next/server";
import { cropImage, ImageFormat } from "@/server/image-engine/sharp-pipeline";
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

    const left = parseInt(formData.get("left") as string);
    const top = parseInt(formData.get("top") as string);
    const width = parseInt(formData.get("width") as string);
    const height = parseInt(formData.get("height") as string);
    const format = (formData.get("format") as ImageFormat) || "jpeg";
    const quality = parseInt((formData.get("quality") as string) || "90");

    if ([left, top, width, height].some((v) => isNaN(v) || v < 0)) {
      return NextResponse.json({ error: "Invalid crop coordinates" }, { status: 400 });
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadToImageKit(inputBuffer, file.name, sessionId);
    inputFileId = uploaded.fileId;

    const outputBuffer = await cropImage(inputBuffer, { left, top, width, height, format, quality });

    if (inputFileId) deleteFile(inputFileId).catch(() => {});

    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        "Content-Type": `image/${format}`,
        "Content-Disposition": `attachment; filename="cropped.${format}"`,
        "Content-Length": outputBuffer.byteLength.toString(),
      },
    });
  } catch (err) {
    console.error("[API /crop]", err);
    if (inputFileId) deleteFile(inputFileId).catch(() => {});
    return NextResponse.json({ error: "Crop failed" }, { status: 500 });
  }
}
