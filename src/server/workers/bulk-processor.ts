import JSZip from "jszip";
import { resizeImage, ResizeOptions, compressImage, CompressOptions, ImageFormat } from "../image-engine/sharp-pipeline";

export type BulkTask =
  | { type: "resize"; options: ResizeOptions }
  | { type: "compress"; options: CompressOptions };

export interface BulkInput {
  buffer: Buffer;
  originalName: string;
}

/**
 * Process multiple images in parallel with a concurrency cap.
 * Returns a ZIP archive buffer ready to stream back to the client.
 */
export async function bulkProcess(
  inputs: BulkInput[],
  task: BulkTask,
  concurrency = 5
): Promise<Buffer> {
  const zip = new JSZip();

  // Process in chunks to avoid OOM
  for (let i = 0; i < inputs.length; i += concurrency) {
    const chunk = inputs.slice(i, i + concurrency);

    const results = await Promise.all(
      chunk.map(async ({ buffer, originalName }) => {
        let processed: Buffer;

        if (task.type === "resize") {
          processed = await resizeImage(buffer, task.options);
        } else {
          processed = await compressImage(buffer, task.options);
        }

        // Build output filename
        const ext = outputExtension(task);
        const baseName = stripExtension(originalName);
        const fileName = `${baseName}_processed.${ext}`;

        return { fileName, processed };
      })
    );

    results.forEach(({ fileName, processed }) => {
      zip.file(fileName, processed);
    });
  }

  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

function outputExtension(task: BulkTask): string {
  if (task.type === "resize") {
    return (task.options.format as string) ?? "jpeg";
  }
  if (task.type === "compress") {
    return (task.options.format as string) ?? "jpeg";
  }
  return "jpeg";
}

function stripExtension(name: string): string {
  return name.replace(/\.[^/.]+$/, "");
}
