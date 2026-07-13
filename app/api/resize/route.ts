import { NextRequest, NextResponse } from "next/server";
import { resizeImage, ResizeOptions, ImageFormat } from "@/server/image-engine/sharp-pipeline";
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

    const width = formData.get("width") ? parseInt(formData.get("width") as string) : undefined;
    const height = formData.get("height") ? parseInt(formData.get("height") as string) : undefined;
    const format = (formData.get("format") as ImageFormat) || "jpeg";
    const quality = parseInt((formData.get("quality") as string) || "90");

    if (!width && !height) {
      return NextResponse.json({ error: "At least width or height is required" }, { status: 400 });
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());

    // Upload original to ImageKit for session tracking
    const uploaded = await uploadToImageKit(inputBuffer, file.name, sessionId, "temp-sessions");
    inputFileId = uploaded.fileId;

    // Process with Sharp
    const options: ResizeOptions = { width, height, format, quality };
    const outputBuffer = await resizeImage(inputBuffer, options);

    // Clean up temp original after processing
    if (inputFileId) {
      deleteFile(inputFileId).catch(() => {}); // fire-and-forget
    }

    // Stream the processed image back
    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        "Content-Type": `image/${format}`,
        "Content-Disposition": `attachment; filename="resized.${format}"`,
        "Content-Length": outputBuffer.byteLength.toString(),
      },
    });
  } catch (err) {
    console.error("[API /resize]", err);
    // Best-effort cleanup
    if (inputFileId) deleteFile(inputFileId).catch(() => {});
    return NextResponse.json({ error: "Resize failed" }, { status: 500 });
  }
}
