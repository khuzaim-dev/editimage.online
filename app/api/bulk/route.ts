import { NextRequest, NextResponse } from "next/server";
import { bulkProcess, BulkTask } from "@/server/workers/bulk-processor";
import { ImageFormat } from "@/server/image-engine/sharp-pipeline";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > 20) {
      return NextResponse.json({ error: "Maximum 20 files per batch" }, { status: 400 });
    }

    const operation = (formData.get("operation") as string) || "resize";
    const width = formData.get("width") ? parseInt(formData.get("width") as string) : undefined;
    const height = formData.get("height") ? parseInt(formData.get("height") as string) : undefined;
    const quality = parseInt((formData.get("quality") as string) || "80");
    const format = (formData.get("format") as ImageFormat) || "jpeg";

    let task: BulkTask;
    if (operation === "compress") {
      task = { type: "compress", options: { quality, format } };
    } else {
      task = { type: "resize", options: { width, height, format, quality } };
    }

    // Convert file list to buffer array
    const inputs = await Promise.all(
      files.map(async (file) => ({
        buffer: Buffer.from(await file.arrayBuffer()),
        originalName: file.name,
      }))
    );

    const zipBuffer = await bulkProcess(inputs, task, 5);

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="pixelforge-bulk.zip"`,
        "Content-Length": zipBuffer.byteLength.toString(),
      },
    });
  } catch (err) {
    console.error("[API /bulk]", err);
    return NextResponse.json({ error: "Bulk processing failed" }, { status: 500 });
  }
}
