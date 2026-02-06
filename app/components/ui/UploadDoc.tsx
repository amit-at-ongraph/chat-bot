"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { FileText, Loader2, PlusIcon, Upload } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Spinner from "../Spinner";
import { useFileStore } from "@/app/store/fileStore";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";

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
  const { selectedFileNames, toggleFile, addFile } = useFileStore();

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

      // Clear selected files after successful upload
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      // Refresh documents list
      await fetchDocuments();

      // Auto-select newly uploaded files
      selectedFiles.forEach((file) => {
        addFile(file.name);
      });

      // Close dialog after successful upload
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
        <Button type="button" variant="ghost" size="icon" className="relative">
          <PlusIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Attachment</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 overflow-hidden">
          <div className="grid gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex-1 min-w-0">
                <Input
                  ref={fileInputRef}
                  id="file"
                  type="file"
                  accept=".txt,.pdf"
                  multiple
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="w-full"
                />
              </div>
              <Button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || isUploading}
                variant="primary"
                size="md"
                className="shrink-0"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-muted-foreground text-sm truncate">
              Select one or more .txt or .pdf files to upload
            </p>
          </div>

          {/* Documents List */}
          <div className="border-border-base border-t pt-4 min-w-0">
            <h3 className="mb-2 text-sm font-semibold truncate">Uploaded Documents</h3>
            {isLoadingDocs ? (
              <div className="flex items-center justify-center py-4">
                <Spinner />
              </div>
            ) : documents.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-sm">
                No documents uploaded yet
              </p>
            ) : (
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className="border-border-base flex items-center gap-2 rounded-lg border p-2"
                  >
                    <Checkbox
                      id={`doc-${index}`}
                      checked={selectedFileNames.includes(doc.fileName)}
                      onCheckedChange={() => toggleFile(doc.fileName)}
                    />
                    <FileText className="h-4 w-4 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{doc.fileName}</p>
                      <p className="text-muted-foreground text-xs">
                        {new Date(doc.createdAt).toLocaleDateString()}
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