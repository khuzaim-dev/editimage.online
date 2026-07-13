import ImageKit, { toFile } from "@imagekit/nodejs";

if (!process.env.IMAGEKIT_PRIVATE_KEY) {
  throw new Error("Missing IMAGEKIT_PRIVATE_KEY environment variable");
}

/**
 * @imagekit/nodejs v7 SDK — only requires privateKey.
 * publicKey and urlEndpoint are NOT used in server-side operations.
 */
export const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

/**
 * Upload a Buffer to ImageKit under a session-scoped folder.
 * Returns the uploaded file's fileId and URL.
 */
export async function uploadToImageKit(
  buffer: Buffer,
  fileName: string,
  sessionId: string,
  folder = "temp-sessions"
): Promise<{ fileId: string; url: string }> {
  // v7 SDK requires an Uploadable — convert Buffer via toFile()
  const uploadable = await toFile(buffer, fileName);
  const result = await imagekit.files.upload({
    file: uploadable,
    fileName,
    folder: `/${folder}/${sessionId}`,
    useUniqueFileName: true,
    tags: [`session:${sessionId}`],
  });

  return {
    fileId: result.fileId ?? "",
    url: result.url ?? "",
  };
}

/**
 * Delete all files under a session's folder to enforce privacy.
 * Called when the user leaves the site.
 */
export async function cleanupSession(sessionId: string): Promise<void> {
  try {
    // List all assets under this session's folder path
    const files = await imagekit.assets.list({
      path: `/temp-sessions/${sessionId}`,
      limit: 100,
      fileType: "all",
    });

    if (!files || files.length === 0) return;

    // Delete all files in parallel (only File items have fileId)
    await Promise.all(
      files
        .filter((item): item is Extract<typeof item, { fileId?: string }> =>
          "fileId" in item && typeof item.fileId === "string"
        )
        .map((file) => imagekit.files.delete(file.fileId as string))
    );
  } catch (err) {
    // Silently fail — cleanup is best-effort
    console.warn(`[ImageKit] Session cleanup failed for ${sessionId}:`, err);
  }
}

/**
 * Delete a single file by ID.
 */
export async function deleteFile(fileId: string): Promise<void> {
  try {
    await imagekit.files.delete(fileId);
  } catch (err) {
    console.warn(`[ImageKit] Delete failed for fileId ${fileId}:`, err);
  }
}
