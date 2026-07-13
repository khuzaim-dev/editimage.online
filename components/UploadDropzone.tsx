"use client";

import { useRef, useState, useCallback, ChangeEvent, DragEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, X, FileImage, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

export interface UploadedFile {
  file: File;
  preview: string;
  width?: number;
  height?: number;
}

interface UploadDropzoneProps {
  onFileSelected?: (f: UploadedFile) => void;
  accept?: string;
  maxMB?: number;
  compact?: boolean;
}

export function UploadDropzone({
  onFileSelected,
  accept = "image/*",
  maxMB = 20,
  compact = false,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploaded, setUploaded] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file.");
        return;
      }
      if (file.size > maxMB * 1024 * 1024) {
        setError(`File size exceeds ${maxMB}MB limit.`);
        return;
      }
      const preview = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => {
        const uploaded: UploadedFile = {
          file,
          preview,
          width: img.naturalWidth,
          height: img.naturalHeight,
        };
        setUploaded(uploaded);
        onFileSelected?.(uploaded);
      };
      img.src = preview;
    },
    [maxMB, onFileSelected]
  );

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clear = () => {
    if (uploaded) URL.revokeObjectURL(uploaded.preview);
    setUploaded(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  if (uploaded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl border border-primary/30 bg-primary/5 dark:bg-primary/10 p-4 flex items-center gap-4"
      >
        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-border flex-shrink-0">
          <Image src={uploaded.preview} alt="preview" fill className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{uploaded.file.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {uploaded.width && uploaded.height ? `${uploaded.width} × ${uploaded.height}px · ` : ""}
            {(uploaded.file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
        <CheckCircle2 className="text-primary flex-shrink-0" size={20} />
        <button
          onClick={clear}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-muted hover:bg-destructive/20 flex items-center justify-center transition-colors"
          aria-label="Remove file"
        >
          <X size={12} />
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer select-none transition-all duration-200",
          compact ? "py-7 px-6" : "py-14 px-8",
          dragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border hover:border-primary/60 hover:bg-muted/50 dark:hover:bg-white/3"
        )}
      >
        <div className={cn(
          "rounded-xl flex items-center justify-center transition-all duration-200",
          compact ? "w-10 h-10" : "w-14 h-14",
          dragging ? "brand-gradient" : "bg-muted dark:bg-white/5"
        )}>
          <Upload
            className={cn(
              "transition-colors",
              compact ? "w-5 h-5" : "w-7 h-7",
              dragging ? "text-white" : "text-muted-foreground"
            )}
          />
        </div>
        <div className="text-center">
          <p className={cn("font-semibold text-foreground", compact ? "text-sm" : "text-base")}>
            {dragging ? "Drop image here" : "Drag & drop image here"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            or click to browse · PNG, JPG, WebP, GIF · up to {maxMB}MB
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={onInputChange}
        />
      </div>

      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <X size={12} /> {error}
        </p>
      )}

      <Button
        className="w-full brand-gradient text-white font-semibold h-11 rounded-xl hover:opacity-90 transition-opacity"
        onClick={() => inputRef.current?.click()}
      >
        <FileImage size={16} className="mr-2" />
        Upload Image
      </Button>
    </div>
  );
}
