"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ArrowUp, CheckCircle, PlusIcon, SquareIcon, Upload, X } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  placeholder?: string;
  maxHeight?: number;
}

interface UploadedFile {
  fileName: string;
  status: "uploaded" | "failed";
  error?: string;
}

export const PromptInput = ({
  value,
  onChange,
  onSubmit,
  onStop,
  isStreaming = false,
  placeholder = "Ask a question...",
  maxHeight = 160,
}: PromptInputProps) => {
  const { theme } = useTheme();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMultiline, setIsMultiline] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadedFile[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const updateHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    const scrollHeight = el.scrollHeight;
    el.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    el.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
    setIsMultiline(scrollHeight > 60);
  }, [maxHeight]);

  useEffect(() => {
    updateHeight();
  }, [value, updateHeight]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    setUploadResults([]);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadResults([]);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadResults(result.uploaded || []);
        // Clear selected files after successful upload
        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        // Close dialog after successful upload
        setTimeout(() => setIsDialogOpen(false), 2000);
      } else {
        setUploadResults([
          {
            fileName: "Upload failed",
            status: "failed",
            error: result.error || "Unknown error",
          },
        ]);
      }
    } catch (error) {
      setUploadResults([
        {
          fileName: "Upload failed",
          status: "failed",
          error: error instanceof Error ? error.message : "Network error",
        },
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e as unknown as React.FormEvent);
      try {
        window.dispatchEvent(new CustomEvent("chat-scroll-to-bottom"));
        window.dispatchEvent(new CustomEvent("chat-submitted"));
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <button
            type={"button"}
            className="hover:bg-border-base flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-all active:scale-90"
          >
            <PlusIcon className="h-5 w-5" fill={theme === "dark" ? "rgb(24,24,24)" : "black"} />
          </button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Attachment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                ref={fileInputRef}
                id="file"
                type="file"
                accept=".txt,.pdf"
                multiple
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              <p className="text-sm text-muted-foreground">
                Select one or more .txt or .pdf files to upload
              </p>
            </div>

            {selectedFiles.length > 0 && (
              <div className="grid gap-2">
                <h4 className="text-sm font-medium">Selected Files:</h4>
                <div className="max-h-32 space-y-1 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-md border p-2 text-sm"
                    >
                      <span className="truncate">{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="ml-2 text-muted-foreground hover:text-foreground"
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploadResults.length > 0 && (
              <div className="grid gap-2">
                <h4 className="text-sm font-medium">Upload Results:</h4>
                <div className="max-h-32 space-y-1 overflow-y-auto">
                  {uploadResults.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 rounded-md border p-2 text-sm ${
                        result.status === "uploaded"
                          ? "border-green-200 bg-green-50 text-green-800"
                          : "border-red-200 bg-red-50 text-red-800"
                      }`}
                    >
                      {result.status === "uploaded" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      <span className="truncate">{result.fileName}</span>
                      {result.error && (
                        <span className="text-xs text-red-600">({result.error})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || isUploading}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Files
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div
        className={`border-border-base bg-prompt-input shadow-outline relative w-full border transition-all duration-200 ${
          isMultiline ? "rounded-[28px]" : "rounded-4xl"
        }`}
      >
        <textarea
          ref={textareaRef}
          placeholder={placeholder}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="no-scrollbar w-full resize-none border border-transparent bg-transparent py-3 pr-14 pl-6 text-[16px] transition-all duration-300 focus:outline-none"
        />

        <button
          type={isStreaming ? "button" : "submit"}
          className="bg-primary hover:bg-primary-hover absolute right-3 bottom-0 flex h-10 w-10 -translate-y-2 cursor-pointer items-center justify-center rounded-full shadow-lg transition-all active:scale-90"
          onClick={isStreaming ? onStop : undefined}
        >
          {isStreaming ? (
            <SquareIcon
              fill={theme === "dark" ? "rgb(24,24,24)" : "white"}
              className="text-app-bg h-4 w-4"
            />
          ) : (
            <ArrowUp className="text-app-bg h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
};
