"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import { FileText, Loader2, PlusIcon, Upload } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Spinner from "../Spinner";
import { Button } from "./Button";

interface DocumentItem {
  fileName: string;
  createdAt: Date;
}

export const UploadDoc = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  const fetchDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const { data } = await axios.get("/api/documents");
      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (isDialogOpen) {
      fetchDocuments();
    }
  }, [isDialogOpen]);

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

      await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      await fetchDocuments();
      setTimeout(() => setIsDialogOpen(false), 500);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-text-muted hover:text-text-main transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Manage Knowledge Base</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Upload Section */}
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <div
              className={`border-primary/20 bg-primary/5 flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 transition-all ${
                isUploading ? "pointer-events-none opacity-50" : "hover:border-primary/40"
              }`}
            >
              <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                <Upload className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold">Click to select files</p>
                <p className="text-text-muted text-xs">Support for PDF and TXT files</p>
              </div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                variant="primary-action"
                size="sm"
                className="px-6"
              >
                Browse Files
              </Button>
            </div>

            {selectedFiles.length > 0 && (
              <div className="bg-selected animate-in fade-in slide-in-from-top-2 rounded-lg p-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
                  Ready to Upload ({selectedFiles.length})
                </p>
                <div className="space-y-1.5">
                  {selectedFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm font-medium">
                      <FileText className="text-primary h-4 w-4" />
                      <span className="truncate">{file.name}</span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  variant="primary"
                  className="mt-4 w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Confirm Upload"
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Documents List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Existing Documents</h3>
              <span className="bg-selected text-text-muted rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                {documents.length} Total
              </span>
            </div>

            {isLoadingDocs ? (
              <div className="flex items-center justify-center py-12">
                <Spinner />
              </div>
            ) : documents.length === 0 ? (
              <div className="bg-selected rounded-xl py-12 text-center">
                <p className="text-text-muted text-sm italic">Your knowledge base is empty</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className="border-border-base group flex items-center gap-3 rounded-xl border p-3 transition-all hover:bg-selected"
                  >
                    <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold group-hover:text-primary transition-colors">
                        {doc.fileName}
                      </p>
                      <p className="text-text-muted text-[11px] font-medium">
                        Added {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
