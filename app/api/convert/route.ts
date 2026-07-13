import { NextRequest, NextResponse } from "next/server";
import { convertFormat, ImageFormat } from "@/server/image-engine/sharp-pipeline";
import { uploadToImageKit, deleteFile } from "@/server/image-engine/imagekit";

const ALLOWED_FORMATS: ImageFormat[] = ["jpeg", "png", "webp", "avif", "gif"];

export async function POST(req: NextRequest) {
  let inputFileId: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const sessionId = formData.get("sessionId") as string;
    const format = (formData.get("format") as ImageFormat) || "webp";
    const quality = parseInt((formData.get("quality") as string) || "90");

    if (!file || !sessionId) {
      return NextResponse.json({ error: "file and sessionId are required" }, { status: 400 });
    }

    if (!ALLOWED_FORMATS.includes(format)) {
      return NextResponse.json({ error: `Invalid format. Allowed: ${ALLOWED_FORMATS.join(", ")}` }, { status: 400 });
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());

    const uploaded = await uploadToImageKit(inputBuffer, file.name, sessionId);
    inputFileId = uploaded.fileId;

    const outputBuffer = await convertFormat(inputBuffer, { format, quality });

    if (inputFileId) deleteFile(inputFileId).catch(() => {});

    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        "Content-Type": `image/${format}`,
        "Content-Disposition": `attachment; filename="converted.${format}"`,
        "Content-Length": outputBuffer.byteLength.toString(),
      },
    });
  } catch (err) {
    console.error("[API /convert]", err);
    if (inputFileId) deleteFile(inputFileId).catch(() => {});
    return NextResponse.json({ error: "Convert failed" }, { status: 500 });
  }
}
