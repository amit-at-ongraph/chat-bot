"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlusIcon, Upload } from "lucide-react";
import React, { useRef, useState } from "react";
import { Button } from "./Button";

export const UploadDoc = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);

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
        // Clear selected files after successful upload
        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        // Close dialog after successful upload
        setTimeout(() => setIsDialogOpen(false), 500);
      } else {
        console.error("Upload failed:", result.error || "Unknown error");
      }
    } catch (error) {
      console.error("Upload failed:", error instanceof Error ? error.message : "Network error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="icon">
          <PlusIcon className="h-5 w-5" />
        </Button>
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
            <p className="text-muted-foreground text-sm">
              Select one or more .txt or .pdf files to upload
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || isUploading}
              variant="primary"
              size="md"
            >
              {isUploading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
