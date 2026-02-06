"use client";

import { useFileStore } from "@/app/store/fileStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import axios from "axios";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Spinner from "../Spinner";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { useTranslation } from "@/app/i18n/useTranslation";

interface DocumentItem {
  fileName: string;
  createdAt: Date;
}

export const UploadDoc = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const {
    selectedFileNames,
    toggleFile,
    addFile,
    clearSelection,
    isUploadDialogOpen,
    setUploadDialogOpen,
  } = useFileStore();
  const { t } = useTranslation();

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
    if (isUploadDialogOpen) {
      fetchDocuments();
    }
  }, [isUploadDialogOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    const uploadToast = toast.loading(t("upload.uploading"));

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

      toast.success(t("upload.upload_success"), { id: uploadToast });

      // Clear selected files after successful upload
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      // Refresh documents list
      await fetchDocuments();

      // Close dialog after successful upload
      setTimeout(() => setUploadDialogOpen(false), 500);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(t("upload.upload_failed"), { id: uploadToast });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isUploadDialogOpen} onOpenChange={setUploadDialogOpen}>
      {/* <DialogTrigger asChild>
        {trigger || (
          <Button type="button" variant="ghost" size="icon" className="relative">
            <PlusIcon className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger> */}

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("upload.title")}</DialogTitle>
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
                  disabled={isUploading || isDeleting}
                  className="w-full"
                />
              </div>
              <Button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || isUploading || isDeleting}
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
              {t("upload.select_files")}
            </p>
          </div>

          {/* Documents List */}
          <div className="border-border-base flex min-w-0 flex-col border-t pt-4">
            <div className="mb-4 flex h-6 items-center justify-between">
              {documents.length > 0 && selectedFileNames.length > 0 ? (
                <>
                  <div
                    className={cn(
                      "group flex cursor-pointer items-center gap-2",
                      (isDeleting || isUploading) &&
                        "pointer-events-none cursor-not-allowed opacity-50",
                    )}
                    onClick={(e) => {
                      if (isDeleting || isUploading) return;
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
                      {t("upload.select_all")}
                    </span>
                  </div>
                  <button
                    disabled={isDeleting || isUploading}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm(t("upload.delete_bulk_confirm", { count: selectedFileNames.length }))) {
                        setIsDeleting(true);
                        const deleteToast = toast.loading(t("upload.deleting") || "Deleting...");
                        try {
                          await axios.post("/api/documents/bulk-delete", {
                            fileNames: selectedFileNames,
                          });
                          toast.success(t("upload.delete_success"), { id: deleteToast });
                          clearSelection();
                          await fetchDocuments();
                        } catch (e) {
                          console.error(e);
                          toast.error(t("upload.delete_failed"), { id: deleteToast });
                        } finally {
                          setIsDeleting(false);
                        }
                      }
                    }}
                    className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-red-500 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>{t("common.delete")}</span>
                  </button>
                </>
              ) : (
                <h3 className="truncate text-sm font-semibold">{t("upload.uploaded_docs")}</h3>
              )}
            </div>

            {isLoadingDocs ? (
              <div className="flex items-center justify-center py-4">
                <Spinner />
              </div>
            ) : documents.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-sm">
                {t("upload.no_docs")}
              </p>
            ) : (
              <div className="max-h-[36vh] space-y-1 overflow-y-auto pr-1">
                {documents.map((doc, index) => {
                  const isSelected = selectedFileNames.includes(doc.fileName);
                  return (
                    <div
                      key={index}
                      className={cn(
                        "group flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors",
                        isSelected ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50",
                        (isUploading || isDeleting) &&
                          "pointer-events-none cursor-not-allowed opacity-50",
                      )}
                      onClick={() => !isUploading && !isDeleting && toggleFile(doc.fileName)}
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
                            onCheckedChange={() =>
                              !isUploading && !isDeleting && toggleFile(doc.fileName)
                            }
                            className="h-4 w-4"
                            disabled={isUploading || isDeleting}
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
                          {(() => {
                            const date = new Date(doc.createdAt);
                            if (isToday(date)) return t("common.today");
                            if (isYesterday(date)) return t("common.yesterday");
                            // Fallback for relative time
                            const diffInDays = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 3600 * 24));
                            if (diffInDays < 1) return t("common.just_now");
                            return t("common.n_days_ago", { n: diffInDays }) || formatDistanceToNow(date, { addSuffix: true });
                          })()}
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
