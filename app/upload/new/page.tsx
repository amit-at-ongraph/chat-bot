"use client";

import { Button } from "@/app/components/ui/Button";
import { useTranslation } from "@/app/i18n/useTranslation";
import axios from "axios";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ChunkMetadataForm } from "../components/ChunkMetadataForm";
import { ChunkSourceEditor } from "../components/ChunkSourceEditor";
import { generateManualFileName } from "../config/uploadConfig";
import { INITIAL_METADATA } from "../types";
import { useChunkForm } from "../useChunkForm";

export default function NewChunkPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [uploadType, setUploadType] = useState<"file" | "paste">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { metadata, content, setContent, handleMetadataChange, handleRoleToggle } = useChunkForm({
    ...INITIAL_METADATA,
    lastReviewed: new Date().toISOString().split("T")[0],
  });

  const handleUpload = async () => {
    if (uploadType === "file" && !selectedFile) {
      toast.error(t("upload.please_select_file"));
      return;
    }
    if (uploadType === "paste" && !content.trim()) {
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
        // Create a .txt file from pasted content with configured prefix
        const fileName = generateManualFileName("txt");
        const file = new File([content], fileName, { type: "text/plain" });
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
          <ChunkMetadataForm
            metadata={metadata}
            onChange={handleMetadataChange}
            onRoleToggle={handleRoleToggle}
            disabled={isUploading}
            renderFooter={() => (
              <Button onClick={handleUpload} disabled={isUploading} variant="primary-action">
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {t("upload.upload_process")}
                  </>
                )}
              </Button>
            )}
          />
        </div>

        {/* Upload Source Section */}
        <div className="space-y-6">
          <ChunkSourceEditor
            uploadType={uploadType}
            onUploadTypeChange={setUploadType}
            selectedFile={selectedFile}
            onFileChange={setSelectedFile}
            content={content}
            onContentChange={setContent}
            disabled={isUploading}
          />
        </div>
      </div>
    </div>
  );
}
