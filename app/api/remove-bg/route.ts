import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { uploadToImageKit, deleteFile } from "@/server/image-engine/imagekit";

import { removeBackground } from "@imgly/background-removal-node";

/**
 * Background Removal using @imgly/background-removal-node
 * This uses a state-of-the-art ONNX model to accurately separate the subject from the background.
 */
async function removeBackgroundImgly(input: Buffer, refineEdges: boolean): Promise<Buffer> {
  const blob = new Blob([new Uint8Array(input)], { type: "image/png" });
  
  // Note: the model automatically downloads on first run and caches locally.
  const resultBlob = await removeBackground(blob);
  const resultBuffer = Buffer.from(await resultBlob.arrayBuffer());

  if (refineEdges) {
    // If refine is requested, we can slightly feather the edges using Sharp
    // Extract alpha, blur it slightly, and recombine
    const alpha = await sharp(resultBuffer).extractChannel(3).blur(0.5).toBuffer();
    return await sharp(resultBuffer)
      .joinChannel(alpha)
      .png()
      .toBuffer();
  }

  return resultBuffer;
}

export async function POST(req: NextRequest) {
  let inputFileId: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const sessionId = formData.get("sessionId") as string;

    if (!file || !sessionId) {
      return NextResponse.json(
        { error: "file and sessionId are required" },
        { status: 400 }
      );
    }

    const refineEdges = formData.get("refine") === "true";

    const inputBuffer = Buffer.from(await file.arrayBuffer());

    // Upload original to ImageKit session for tracking
    const uploaded = await uploadToImageKit(inputBuffer, file.name, sessionId);
    inputFileId = uploaded.fileId;

    // Process background removal using @imgly/background-removal-node
    const outputBuffer = await removeBackgroundImgly(inputBuffer, refineEdges);

    // Clean up temp file
    if (inputFileId) deleteFile(inputFileId).catch(() => {});

    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="removed-bg.png"`,
        "Content-Length": outputBuffer.byteLength.toString(),
      },
    });
  } catch (err) {
    console.error("[API /remove-bg]", err);
    if (inputFileId) deleteFile(inputFileId).catch(() => {});
    return NextResponse.json({ error: "Background removal failed" }, { status: 500 });
  }
}
