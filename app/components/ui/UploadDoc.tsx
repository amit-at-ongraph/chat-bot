"use client";

import { useFileStore } from "@/app/store/fileStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { FileText, Loader2, PlusIcon, Trash2, Upload } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Spinner from "../Spinner";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";

interface DocumentItem {
  fileName: string;
  createdAt: Date;
}

interface UploadDocProps {
  trigger?: React.ReactNode;
}

export const UploadDoc = ({ trigger }: UploadDocProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const { selectedFileNames, toggleFile, addFile, clearSelection } = useFileStore();

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
        {trigger || (
          <Button type="button" variant="ghost" size="icon" className="relative">
            <PlusIcon className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Attachment</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 overflow-hidden py-4">
          <div className="grid min-w-0 gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="min-w-0 flex-1">
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
            <p className="text-muted-foreground truncate text-sm">
              Select one or more .txt or .pdf files to upload
            </p>
          </div>

          {/* Documents List */}
          <div className="border-border-base flex min-w-0 flex-col border-t pt-4">
            <div className="mb-4 flex h-6 items-center justify-between">
              {documents.length > 0 && selectedFileNames.length > 0 ? (
                <>
                  <div
                    className="group flex cursor-pointer items-center gap-2"
                    onClick={(e) => {
                      e.preventDefault();
                      const allNames = documents.map((d) => d.fileName);
                      const allSelected = allNames.every((name) =>
                        selectedFileNames.includes(name),
                      );
                      if (allSelected) {
                        allNames.forEach((name) => {
                          if (selectedFileNames.includes(name)) toggleFile(name);
                        });
                      } else {
                        allNames.forEach((name) => {
                          if (!selectedFileNames.includes(name)) addFile(name);
                        });
                      }
                    }}
                  >
                    <Checkbox
                      checked={
                        documents.length > 0 &&
                        documents.every((d) => selectedFileNames.includes(d.fileName))
                      }
                      className="h-4 w-4"
                      onCheckedChange={() => {}}
                    />
                    <span className="text-muted-foreground group-hover:text-foreground cursor-pointer text-xs font-medium">
                      Select All
                    </span>
                  </div>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm(`Delete ${selectedFileNames.length} selected files?`)) {
                        try {
                          await axios.post("/api/documents/bulk-delete", {
                            fileNames: selectedFileNames,
                          });
                          clearSelection();
                          await fetchDocuments();
                        } catch (e) {
                          console.error(e);
                        }
                      }
                    }}
                    className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-red-500 transition-colors hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </>
              ) : (
                <h3 className="truncate text-sm font-semibold">Uploaded Documents</h3>
              )}
            </div>

            {isLoadingDocs ? (
              <div className="flex items-center justify-center py-4">
                <Spinner />
              </div>
            ) : documents.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-sm">
                No documents uploaded yet
              </p>
            ) : (
              <div className="max-h-60 space-y-1 overflow-y-auto pr-1">
                {documents.map((doc, index) => {
                  const isSelected = selectedFileNames.includes(doc.fileName);
                  return (
                    <div
                      key={index}
                      className={`group flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors ${
                        isSelected ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"
                      }`}
                      onClick={() => toggleFile(doc.fileName)}
                    >
                      <div className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                        <div
                          className={`absolute inset-0 transition-opacity duration-200 ${
                            isSelected
                              ? "scale-75 opacity-0"
                              : "scale-100 opacity-100 group-hover:scale-75 group-hover:opacity-0"
                          }`}
                        >
                          <FileText className="text-muted-foreground h-4 w-4" />
                        </div>
                        <div
                          className={`absolute inset-0 transition-all duration-200 ${
                            isSelected
                              ? "scale-100 opacity-100"
                              : "scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleFile(doc.fileName)}
                            className="h-4 w-4"
                          />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm transition-colors ${
                            isSelected ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {doc.fileName}
                        </p>
                        <p className="text-muted-foreground text-[10px]">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
