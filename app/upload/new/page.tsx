"use client";

import { Button } from "@/app/components/ui/Button";
import { useTranslation } from "@/app/i18n/useTranslation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApplicableRole, Jurisdiction, LifecycleState, Scenario } from "@/lib/constants";
import { cn } from "@/lib/utils";
import axios from "axios";
import { ArrowLeft, FileText, Loader2, Type, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

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

export default function NewChunkPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [uploadType, setUploadType] = useState<"file" | "paste">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedContent, setPastedContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [metadata, setMetadata] = useState({
    topic: "",
    jurisdiction: Jurisdiction.GLOBAL as string,
    scenario: Scenario.GLOBAL as string,
    applicableRoles: [] as string[],
    lifecycleState: LifecycleState.ACTIVE as string,
    lastReviewed: new Date().toISOString().split("T")[0],
    lexicalTriggers: "",
  });

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
    if (uploadType === "file" && !selectedFile) {
      toast.error("Please select a file");
      return;
    }
    if (uploadType === "paste" && !pastedContent.trim()) {
      toast.error("Please paste some content");
      return;
    }

    setIsUploading(true);
    const uploadToast = toast.loading("Processing upload...");

    try {
      const formData = new FormData();

      if (uploadType === "file" && selectedFile) {
        formData.append("files", selectedFile);
      } else {
        // Create a .txt file from pasted content
        const fileName = `manual-entry-${Date.now()}.txt`;
        const file = new File([pastedContent], fileName, { type: "text/plain" });
        formData.append("files", file);
      }

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
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Upload successful!", { id: uploadToast });
      router.push("/upload");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload failed", { id: uploadToast });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto space-y-8 px-4 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/upload">
          <Button
            variant="none"
            size="none"
            className="text-text-muted hover:text-text-main p-2 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h2 className="mb-0">Add New Chunk</h2>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Metadata Section */}
        <div className="space-y-6 lg:col-span-2">
          <div className="border-border-base bg-header-bg sticky top-8 space-y-6 rounded-2xl border p-6 shadow-xs">
            <h2 className="border-border-base flex items-center gap-2 border-b pb-4 text-sm font-semibold">
              <Database className="h-4 w-4" /> Chunk Metadata
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Topic">
                <Input
                  value={metadata.topic}
                  onChange={(e) => handleMetadataChange("topic", e.target.value)}
                  placeholder="e.g. Warrant Procedures"
                  disabled={isUploading}
                  className="dark:bg-background bg-white text-[13px]"
                />
              </FormField>

              <FormField label="Jurisdiction">
                <Select
                  value={metadata.jurisdiction}
                  onValueChange={(value) => handleMetadataChange("jurisdiction", value)}
                  disabled={isUploading}
                >
                  <SelectTrigger className="w-full text-left text-[13px]">
                    <SelectValue placeholder="Select Jurisdiction" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Jurisdiction).map((j) => (
                      <SelectItem key={j} value={j}>
                        {t(`upload.${j}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Scenario">
                <Select
                  value={metadata.scenario}
                  onValueChange={(value) => handleMetadataChange("scenario", value)}
                  disabled={isUploading}
                >
                  <SelectTrigger className="w-full text-left text-[13px]">
                    <SelectValue placeholder="Select Scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Scenario).map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(`upload.${s}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Status">
                <Select
                  value={metadata.lifecycleState}
                  onValueChange={(value) => handleMetadataChange("lifecycleState", value)}
                  disabled={isUploading}
                >
                  <SelectTrigger className="w-full text-left text-[13px]">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(LifecycleState).map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(`upload.${s}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Last Reviewed">
                <Input
                  type="date"
                  value={metadata.lastReviewed}
                  onChange={(e) => handleMetadataChange("lastReviewed", e.target.value)}
                  disabled={isUploading}
                  className="dark:bg-background bg-white text-[13px]"
                />
              </FormField>

              <FormField label="Lexical Triggers (comma separated)">
                <Input
                  value={metadata.lexicalTriggers}
                  onChange={(e) => handleMetadataChange("lexicalTriggers", e.target.value)}
                  placeholder="keyword1, keyword2..."
                  disabled={isUploading}
                  className="dark:bg-background bg-white text-[13px]"
                />
              </FormField>

              <FormField label="Applicable Roles">
                <div className="flex flex-wrap gap-2 pt-1">
                  {Object.values(ApplicableRole).map((role) => {
                    const isSelected = metadata.applicableRoles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleRoleToggle(role)}
                        disabled={isUploading}
                        className={cn(
                          "rounded-lg border px-2.5 py-1 text-[12px] font-medium transition-all duration-200",
                          isSelected
                            ? "bg-primary border-primary text-white shadow-sm"
                            : "border-border-base bg-app-bg text-text-muted hover:border-primary/50 hover:text-text-main",
                        )}
                      >
                        {t(`upload.${role}`)}
                      </button>
                    );
                  })}
                </div>
              </FormField>
            </div>

            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="mt-4 w-full rounded-xl font-medium"
              variant="primary"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload & Process
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Upload Source Section */}
        <div className="space-y-6">
          <div className="border-border-base bg-header-bg space-y-6 rounded-2xl border p-6 shadow-xs">
            <div className="border-border-base flex items-center justify-between border-b pb-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Upload className="h-4 w-4" /> Source Content
              </h2>
              <div className="bg-app-bg border-border-base flex rounded-lg border p-0.5">
                <button
                  onClick={() => setUploadType("file")}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                    uploadType === "file"
                      ? "bg-primary text-white shadow-sm"
                      : "text-text-muted hover:text-text-main",
                  )}
                >
                  <FileText className="h-3.5 w-3.5" /> File
                </button>
                <button
                  onClick={() => setUploadType("paste")}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                    uploadType === "paste"
                      ? "bg-primary text-white shadow-sm"
                      : "text-text-muted hover:text-text-main",
                  )}
                >
                  <Type className="h-3.5 w-3.5" /> Paste
                </button>
              </div>
            </div>

            {uploadType === "file" ? (
              <div className="space-y-4">
                <div className="border-border-base bg-app-bg hover:bg-border-light/50 group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-colors">
                  <input
                    type="file"
                    id="chunk-file"
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    accept=".pdf,.txt"
                  />
                  <label htmlFor="chunk-file" className="cursor-pointer space-y-4">
                    <div className="bg-primary/5 text-primary group-hover:bg-primary/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full transition-colors">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {selectedFile ? selectedFile.name : "Click to select"}
                      </p>
                      <p className="text-text-muted text-xs">PDF or Plain Text (max. 10MB)</p>
                    </div>
                  </label>
                  {selectedFile && (
                    <Button
                      variant="none"
                      onClick={() => setSelectedFile(null)}
                      className="mt-4 text-[11px] font-medium text-red-500 hover:underline"
                    >
                      Remove File
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  className="bg-app-bg border-border-base focus:ring-primary/20 h-80 w-full resize-none rounded-xl border p-4 text-[13px] leading-relaxed transition-all focus:ring-2 focus:outline-none"
                  placeholder="Paste your document content here..."
                  value={pastedContent}
                  onChange={(e) => setPastedContent(e.target.value)}
                />
                <div className="flex items-center justify-between px-1">
                  <p className="text-text-muted text-[11px] italic">Supports UTF-8 characters</p>
                  <p className="text-text-muted text-[11px] font-medium tracking-tight uppercase">
                    {pastedContent.length} Characters
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to keep Database icon imported since it's used in h2
function Database({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}
