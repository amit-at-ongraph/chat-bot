"use client";
import { TextareaWithLineNumbers } from "@/app/components/TextareaWithLineNumbers";
import { Button } from "@/app/components/ui/Button";
import { useTranslation } from "@/app/i18n/useTranslation";
import { createOptionsFromEnum } from "@/app/utils/string.utils";
import { EnumSelect } from "@/components/ui/enum-select";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { ApplicableRole, Jurisdiction, LifecycleState, Scenario } from "@/lib/constants";
import { cn } from "@/lib/utils";
import axios from "axios";
import { ArrowLeft, Database, FileText, Loader2, Type, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
      toast.error(t("upload.please_select_file"));
      return;
    }
    if (uploadType === "paste" && !pastedContent.trim()) {
      toast.error(t("upload.please_paste_content"));
      return;
    }

    setIsUploading(true);
    const uploadToast = toast.loading(t("upload.processing_upload"));

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
            ? metadata.lexicalTriggers.split(/[;,]/).map((s) => s.trim())
            : [],
        }),
      );

      await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(t("upload.upload_success"), { id: uploadToast });
      router.push("/upload");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(t("upload.upload_failed"), { id: uploadToast });
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
        <h2 className="mb-0 font-medium">{t("upload.add_new_document")}</h2>
      </div>

      <div className="flex flex-col-reverse gap-8 lg:grid lg:grid-cols-3">
        {/* Metadata Section */}
        <div className="space-y-6 lg:col-span-2">
          <div className="border-border-base bg-header-bg sticky top-8 space-y-6 rounded-2xl border p-6 shadow-xs">
            <h2 className="border-border-base flex items-center gap-2 border-b pb-4 text-sm font-semibold">
              <Database className="h-4 w-4" /> {t("upload.metadata")}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <FormField label={t("upload.topic")}>
                <Input
                  value={metadata.topic}
                  onChange={(e) => handleMetadataChange("topic", e.target.value)}
                  placeholder={t("upload.topic_placeholder")}
                  disabled={isUploading}
                  className="dark:bg-background bg-white text-[13px]"
                />
              </FormField>

              <FormField label={t("upload.jurisdiction")}>
                <EnumSelect
                  value={metadata.jurisdiction}
                  onValueChange={(value) => handleMetadataChange("jurisdiction", value)}
                  options={createOptionsFromEnum(Jurisdiction)}
                  placeholder={t("upload.jurisdiction")}
                  disabled={isUploading}
                  triggerClassName="w-full text-left text-[13px]"
                />
              </FormField>

              <FormField label={t("upload.scenario")}>
                <EnumSelect
                  value={metadata.scenario}
                  onValueChange={(value) => handleMetadataChange("scenario", value)}
                  options={createOptionsFromEnum(Scenario)}
                  placeholder={t("upload.scenario")}
                  disabled={isUploading}
                  triggerClassName="w-full text-left text-[13px]"
                />
              </FormField>

              <FormField label={t("upload.status")}>
                <EnumSelect
                  value={metadata.lifecycleState}
                  onValueChange={(value) => handleMetadataChange("lifecycleState", value)}
                  options={createOptionsFromEnum(LifecycleState)}
                  placeholder={t("upload.status")}
                  disabled={isUploading}
                  triggerClassName="w-full text-left text-[13px]"
                />
              </FormField>

              <FormField label={t("upload.last_reviewed")}>
                <Input
                  type="date"
                  value={metadata.lastReviewed}
                  onChange={(e) => handleMetadataChange("lastReviewed", e.target.value)}
                  disabled={isUploading}
                  className="dark:bg-background bg-white text-[13px]"
                />
              </FormField>

              <FormField label={t("upload.lexical_triggers")}>
                <Input
                  value={metadata.lexicalTriggers}
                  onChange={(e) => handleMetadataChange("lexicalTriggers", e.target.value)}
                  placeholder={t("upload.lexical_triggers_placeholder")}
                  disabled={isUploading}
                  className="dark:bg-background bg-white text-[13px]"
                />
              </FormField>

              <FormField label={t("upload.applicable_roles")}>
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
              className="mt-4"
              variant="primary-action"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {t("upload.upload_process")}
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
                <Upload className="h-4 w-4" /> {t("upload.source_content")}
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
                  <FileText className="h-3.5 w-3.5" /> {t("upload.file")}
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
                  <Type className="h-3.5 w-3.5" /> {t("upload.paste")}
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
                        {selectedFile ? selectedFile.name : t("upload.click_to_select")}
                      </p>
                      <p className="text-text-muted text-xs">{t("upload.pdf_txt_hint")}</p>
                    </div>
                  </label>
                  {selectedFile && (
                    <Button
                      variant="none"
                      onClick={() => setSelectedFile(null)}
                      className="mt-4 text-[11px] font-medium text-red-500 hover:underline"
                    >
                      {t("upload.remove_file")}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <TextareaWithLineNumbers
                value={pastedContent}
                onChange={(value) => setPastedContent(value)}
                placeholder={t("upload.paste_content_placeholder")}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
