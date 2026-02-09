"use client";

import { useTranslation } from "@/app/i18n/useTranslation";
import { useFileStore } from "@/app/store/fileStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Jurisdiction } from "@/lib/constants";
import { cn } from "@/lib/utils";
import axios from "axios";
import { formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { ArrowRight, FileText, Loader2, Trash2, Upload } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Spinner from "../Spinner";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";

interface DocumentItem {
  fileName: string;
  createdAt: Date;
}

const FormField = ({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex flex-col gap-1.5", className)}>
    <label className="text-text-main text-xs font-semibold">{label}</label>
    <div className="relative">{children}</div>
  </div>
);

export const UploadDoc = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [currentStep, setCurrentStep] = useState<"upload" | "metadata">("upload");

  const {
    selectedFileNames,
    toggleFile,
    addFile,
    clearSelection,
    isUploadDialogOpen,
    setUploadDialogOpen,
  } = useFileStore();
  const { t } = useTranslation();

  const [metadata, setMetadata] = useState({
    topic: "",
    jurisdiction: Jurisdiction.GLOBAL as string,
    scope: "global" as "global" | "regional" | "local",
    applicableRoles: [] as string[],
    authorityLevel: 0,
    lifecycleState: "active" as "active" | "inactive" | "archived" | "draft",
    lastReviewed: "",
    retrievalWeight: 1.0,
    lexicalTriggers: "",
  });

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
      setCurrentStep("upload");
    }
  }, [isUploadDialogOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files.slice(0, 1)); // One file at a time
  };

  const handleMetadataChange = (key: string, value: any) => {
    setMetadata((prev) => ({ ...prev, [key]: value }));
  };

  const handleRoleToggle = (role: string) => {
    setMetadata((prev) => ({
      ...prev,
      applicableRoles: prev.applicableRoles.includes(role)
        ? prev.applicableRoles.filter((r) => r !== role)
        : [...prev.applicableRoles, role],
    }));
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

      // Append metadata
      formData.append(
        "metadata",
        JSON.stringify({
          ...metadata,
          lexicalTriggers: metadata.lexicalTriggers
            ? metadata.lexicalTriggers.split(",").map((s) => s.trim())
            : [],
        }),
      );

      await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(t("upload.upload_success"), { id: uploadToast });

      // Reset state after successful upload
      setSelectedFiles([]);
      setMetadata({
        topic: "",
        jurisdiction: Jurisdiction.GLOBAL,
        scope: "global",
        applicableRoles: [],
        authorityLevel: 0,
        lifecycleState: "active",
        lastReviewed: "",
        retrievalWeight: 1.0,
        lexicalTriggers: "",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      await fetchDocuments();
      setUploadDialogOpen(false);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(t("upload.upload_failed"), { id: uploadToast });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isUploadDialogOpen} onOpenChange={setUploadDialogOpen}>
      <DialogContent className="bg-app-bg border-border-base flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-border-base border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-text-main text-lg font-semibold">
              {currentStep === "upload" ? t("upload.title") : t("upload.metadata")}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          {/* Step 1: File Selection & Document List */}
          <div className={cn(currentStep !== "upload" && "hidden")}>
            <div className="grid gap-6 p-6">
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      ref={fileInputRef}
                      id="file"
                      type="file"
                      accept=".txt,.pdf"
                      onChange={handleFileSelect}
                      disabled={isUploading || isDeleting}
                      className="w-full"
                    />
                  </div>
                  <Button
                    onClick={() => setCurrentStep("metadata")}
                    variant="primary"
                    className="shrink-0"
                    disabled={selectedFiles.length <= 0}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-text-muted text-sm">{t("upload.select_files")}</p>
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
                          if (
                            confirm(
                              t("upload.delete_bulk_confirm", { count: selectedFileNames.length }),
                            )
                          ) {
                            setIsDeleting(true);
                            const deleteToast = toast.loading(
                              t("upload.deleting") || "Deleting...",
                            );
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
                                const diffInDays = Math.floor(
                                  (new Date().getTime() - date.getTime()) / (1000 * 3600 * 24),
                                );
                                if (diffInDays < 1) return t("common.just_now");
                                return (
                                  t("common.n_days_ago", { n: diffInDays }) ||
                                  formatDistanceToNow(date, { addSuffix: true })
                                );
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
          </div>

          {/* Step 2: Metadata Selection */}
          <div className={cn(currentStep !== "metadata" && "hidden")}>
            <div className="grid gap-6 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label={t("upload.topic")}>
                  <Input
                    value={metadata.topic}
                    onChange={(e) => handleMetadataChange("topic", e.target.value)}
                    placeholder={t("upload.topic")}
                    disabled={isUploading}
                  />
                </FormField>

                <FormField label={t("upload.jurisdiction")}>
                  <select
                    value={metadata.jurisdiction}
                    onChange={(e) => handleMetadataChange("jurisdiction", e.target.value)}
                    disabled={isUploading}
                    className="border-border-base bg-app-bg text-text-main focus:ring-primary/20 h-10 w-full rounded-xl border px-3 text-sm focus:ring-2 focus:outline-none"
                  >
                    {Object.values(Jurisdiction).map((j) => (
                      <option key={j} value={j}>
                        {t(`upload.${j}`)}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label={t("upload.scope")}>
                  <select
                    value={metadata.scope}
                    onChange={(e) => handleMetadataChange("scope", e.target.value)}
                    disabled={isUploading}
                    className="border-border-base bg-app-bg text-text-main focus:ring-primary/20 h-10 w-full rounded-xl border px-3 text-sm focus:ring-2 focus:outline-none"
                  >
                    <option value="global">{t("upload.global")}</option>
                    <option value="regional">{t("upload.regional")}</option>
                    <option value="local">{t("upload.local")}</option>
                  </select>
                </FormField>

                <FormField label={t("upload.lifecycle_state")}>
                  <select
                    value={metadata.lifecycleState}
                    onChange={(e) => handleMetadataChange("lifecycleState", e.target.value)}
                    disabled={isUploading}
                    className="border-border-base bg-app-bg text-text-main focus:ring-primary/20 h-10 w-full rounded-xl border px-3 text-sm focus:ring-2 focus:outline-none"
                  >
                    <option value="active">{t("upload.active")}</option>
                    <option value="inactive">{t("upload.inactive")}</option>
                    <option value="archived">{t("upload.archived")}</option>
                    <option value="draft">{t("upload.draft")}</option>
                  </select>
                </FormField>

                <FormField label={t("upload.authority_level")}>
                  <Input
                    type="number"
                    value={metadata.authorityLevel}
                    onChange={(e) =>
                      handleMetadataChange("authorityLevel", parseInt(e.target.value) || 0)
                    }
                    disabled={isUploading}
                  />
                </FormField>

                <FormField label={t("upload.retrieval_weight")}>
                  <Input
                    type="number"
                    step="0.1"
                    value={metadata.retrievalWeight}
                    onChange={(e) =>
                      handleMetadataChange("retrievalWeight", parseFloat(e.target.value) || 0)
                    }
                    disabled={isUploading}
                  />
                </FormField>

                <FormField label={t("upload.last_reviewed")}>
                  <Input
                    type="date"
                    value={metadata.lastReviewed}
                    onChange={(e) => handleMetadataChange("lastReviewed", e.target.value)}
                    disabled={isUploading}
                  />
                </FormField>

                <FormField label={t("upload.lexical_triggers")}>
                  <Input
                    value={metadata.lexicalTriggers}
                    onChange={(e) => handleMetadataChange("lexicalTriggers", e.target.value)}
                    placeholder={t("upload.lexical_triggers_placeholder")}
                    disabled={isUploading}
                  />
                </FormField>

                <FormField label={t("upload.applicable_roles")} className="sm:col-span-2">
                  <div className="flex flex-wrap gap-4 pt-1">
                    {["general", "advocate"].map((role) => (
                      <div key={role} className="flex items-center gap-2">
                        <Checkbox
                          id={`role-${role}`}
                          checked={metadata.applicableRoles.includes(role)}
                          onCheckedChange={() => handleRoleToggle(role)}
                          disabled={isUploading}
                        />
                        <label
                          htmlFor={`role-${role}`}
                          className="text-text-main cursor-pointer text-sm"
                        >
                          {t(`upload.${role}`)}
                        </label>
                      </div>
                    ))}
                  </div>
                </FormField>
              </div>

              <div className="mt-4 flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentStep("upload")}
                  disabled={isUploading}
                  className="flex-1"
                >
                  {t("common.back")}
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1"
                  variant="primary"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      {t("upload.finish")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
