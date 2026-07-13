import { NextRequest, NextResponse } from "next/server";
import { editImage, ImageFormat } from "@/server/image-engine/sharp-pipeline";
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

    const format = (formData.get("format") as ImageFormat) || "jpeg";
    const quality = parseInt((formData.get("quality") as string) || "90");

    // Sliders come in as 0-100 from the UI; convert to Sharp ranges
    const brightnessRaw = parseFloat((formData.get("brightness") as string) || "0");
    const contrastRaw = parseFloat((formData.get("contrast") as string) || "0");
    const saturationRaw = parseFloat((formData.get("saturation") as string) || "0");
    const blurRaw = parseFloat((formData.get("blur") as string) || "0");
    const filter = (formData.get("filter") as string) || "None";

    // Convert -100..100 slider → Sharp modulate range 0..2 (1 = no change)
    const toBrightness = (v: number) => 1 + v / 100;
    const toSaturation = (v: number) => 1 + v / 100;

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadToImageKit(inputBuffer, file.name, sessionId);
    inputFileId = uploaded.fileId;

    const outputBuffer = await editImage(inputBuffer, {
      brightness: toBrightness(brightnessRaw),
      saturation: toSaturation(saturationRaw),
      blur: blurRaw > 0 ? blurRaw / 5 : undefined,
      grayscale: filter === "Grayscale",
      sepia: filter === "Sepia",
      invert: filter === "Invert",
      format,
      quality,
    });

    if (inputFileId) deleteFile(inputFileId).catch(() => {});

    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        "Content-Type": `image/${format}`,
        "Content-Disposition": `attachment; filename="edited.${format}"`,
        "Content-Length": outputBuffer.byteLength.toString(),
      },
    });
  } catch (err) {
    console.error("[API /edit]", err);
    if (inputFileId) deleteFile(inputFileId).catch(() => {});
    return NextResponse.json({ error: "Edit failed" }, { status: 500 });
  }
}
