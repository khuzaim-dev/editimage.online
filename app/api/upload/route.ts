import { NextRequest, NextResponse } from "next/server";
import { uploadToImageKit } from "@/server/image-engine/imagekit";
import { v4 as uuidv4 } from "uuid";

const MAX_SIZE_MB = 20;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const sessionId = (formData.get("sessionId") as string) || uuidv4();

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File exceeds ${MAX_SIZE_MB}MB limit` },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { fileId, url } = await uploadToImageKit(buffer, file.name, sessionId);

    return NextResponse.json({ fileId, url, sessionId });
  } catch (err) {
    console.error("[API /upload]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
