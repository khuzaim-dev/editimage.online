"use client";

import { useState, useCallback } from "react";

export type ProcessState = "idle" | "uploading" | "processing" | "done" | "error";

interface UseImageProcessorOptions {
  apiRoute: string;           // e.g. "/api/resize"
  sessionId: string;
  outputFileName?: string;    // e.g. "resized.webp"
}

interface UseImageProcessorReturn {
  state: ProcessState;
  error: string | null;
  resultSize: number | null;
  process: (file: File, params: Record<string, string>) => Promise<void>;
  reset: () => void;
}

/**
 * Generic hook for sending a file + settings to any image API route,
 * then triggering a browser download of the result.
 */
export function useImageProcessor({
  apiRoute,
  sessionId,
  outputFileName = "output",
}: UseImageProcessorOptions): UseImageProcessorReturn {
  const [state, setState] = useState<ProcessState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);

  const process = useCallback(
    async (file: File, params: Record<string, string>) => {
      if (!sessionId) return;

      setState("uploading");
      setError(null);
      setResultSize(null);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("sessionId", sessionId);

        // Append all settings from the calling page
        Object.entries(params).forEach(([k, v]) => formData.append(k, v));

        setState("processing");
        const res = await fetch(apiRoute, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(errJson.error || `HTTP ${res.status}`);
        }

        const blob = await res.blob();
        setResultSize(blob.size);

        // Trigger browser download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = outputFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setState("done");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Processing failed";
        setError(msg);
        setState("error");
      }
    },
    [apiRoute, sessionId, outputFileName]
  );

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
    setResultSize(null);
  }, []);

  return { state, error, resultSize, process, reset };
}
