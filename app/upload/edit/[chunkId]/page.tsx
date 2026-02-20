"use client";

import { Button } from "@/app/components/ui/Button";
import { useTranslation } from "@/app/i18n/useTranslation";
import { ApplicableRole, Jurisdiction, LifecycleState, Scenario } from "@/lib/constants";
import { cn } from "@/lib/utils";
import axios from "axios";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChunkMetadataForm } from "../../components/ChunkMetadataForm";
import { ChunkSourceEditor } from "../../components/ChunkSourceEditor";
import { Chunk, chunkService } from "../../service";
import { INITIAL_METADATA } from "../../types";
import { useChunkForm } from "../../useChunkForm";

export default function EditChunkPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams<{ chunkId: string }>();
  const chunkId = params?.chunkId;

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingMetadata, setIsUpdatingMetadata] = useState(false);
  const [isUpdatingContent, setIsUpdatingContent] = useState(false);

  const [uploadType, setUploadType] = useState<"file" | "paste">("paste");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { metadata, setMetadata, content, setContent, handleMetadataChange, handleRoleToggle } =
    useChunkForm(INITIAL_METADATA);

  useEffect(() => {
    const fetchChunk = async () => {
      if (!chunkId) return;
      try {
        const chunk = await chunkService.fetchOne(chunkId);
        setContent(chunk.content);
        setMetadata({
          topic: chunk.topic || "",
          jurisdiction: (chunk.jurisdiction as Jurisdiction) || Jurisdiction.GLOBAL,
          scenario: (chunk.scenario as Scenario) || Scenario.GLOBAL,
          applicableRoles: (chunk.applicableRoles as ApplicableRole[]) || [],
          lifecycleState: (chunk.lifecycleState as LifecycleState) || LifecycleState.ACTIVE,
          lastReviewed: chunk.lastReviewed
            ? new Date(chunk.lastReviewed).toISOString().split("T")[0]
            : "",
          lexicalTriggers: chunk.lexicalTriggers ? chunk.lexicalTriggers.join(", ") : "",
        });
      } catch (error) {
        console.error("Failed to fetch chunk:", error);
        toast.error(t("upload.fetch_failed"));
        router.push("/upload");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChunk();
  }, [chunkId, router, t, setContent, setMetadata]);

  const handleUpdateMetadata = async () => {
    if (!chunkId) return;
    setIsUpdatingMetadata(true);
    const updateToast = toast.loading(t("upload.updating"));

    try {
      const payload: Partial<Chunk> = {
        ...metadata,
        lexicalTriggers: metadata.lexicalTriggers
          ? metadata.lexicalTriggers.split(/[;,]/).map((s) => s.trim())
          : [],
      };

      await chunkService.updateMetadata(chunkId, payload);

      toast.success(t("upload.metadata_updated"), { id: updateToast });
    } catch (error) {
      console.error("Update metadata failed:", error);
      toast.error(t("upload.update_failed"), { id: updateToast });
    } finally {
      setIsUpdatingMetadata(false);
    }
  };

  const handleUpdateContent = async () => {
    if (!chunkId) return;

    let finalContent = content;

    if (uploadType === "file") {
      if (!selectedFile) {
        toast.error(t("upload.please_select_file"));
        return;
      }

      // If it's a text file, we can read it directly
      if (selectedFile.type === "text/plain") {
        finalContent = await selectedFile.text();
      } else {
        // For PDF or other types, we use server-side parsing
        setIsUpdatingContent(true);
        const parseToast = toast.loading("Parsing PDF...");
        try {
          const formData = new FormData();
          formData.append("file", selectedFile);
          const response = await axios.post("/api/parse-pdf", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: "Basic " + btoa(`:${process.env.BASIC_AUTH_SCERET}`),
            },
          });

          if (response.data.success) {
            const fileContent = response.data.text;
            finalContent = fileContent;
            toast.success("PDF parsed successfully", { id: parseToast });
            await new Promise<void>((resolve) =>
              setTimeout(() => {
                toast.dismiss(parseToast);
                resolve();
              }, 300),
            );
          } else {
            throw new Error(response.data.error || "Parsing failed");
          }
        } catch (error) {
          console.error("PDF parsing failed:", error);
          toast.error("Failed to parse PDF file.", { id: parseToast });
          setIsUpdatingContent(false);
          return;
        }
      }
    }

    if (!finalContent.trim()) {
      toast.error(t("upload.please_paste_content"));
      return;
    }

    setIsUpdatingContent(true);
    const updateToast = toast.loading(t("upload.updating"));

    try {
      await chunkService.updateContent(chunkId, finalContent);
      toast.success(t("upload.content_updated"), { id: updateToast });
      if (uploadType === "file") {
        setContent(finalContent);
        setUploadType("paste");
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Update content failed:", error);
      toast.error(t("upload.update_failed"), { id: updateToast });
    } finally {
      setIsUpdatingContent(false);
    }
  };

  return (
    <div className="mx-auto space-y-8 px-4 pb-12 transition-all duration-500">
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
        <h2 className="mb-0 font-medium">{t("upload.edit_document")}</h2>
      </div>

      <div
        className={cn(
          "flex flex-col-reverse gap-8 lg:grid lg:grid-cols-3",
          isLoading ? "pointer-events-none opacity-40 grayscale-50" : "opacity-100",
        )}
      >
        {/* Metadata Section */}
        <div className="space-y-6 lg:col-span-2">
          <ChunkMetadataForm
            metadata={metadata}
            onChange={handleMetadataChange}
            onRoleToggle={handleRoleToggle}
            disabled={isUpdatingMetadata || isLoading}
            renderFooter={() => (
              <Button
                onClick={handleUpdateMetadata}
                disabled={isUpdatingMetadata || isUpdatingContent || isLoading}
                variant="primary-action"
              >
                {isUpdatingMetadata ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t("upload.update_metadata")}
                  </>
                )}
              </Button>
            )}
          />
        </div>

        {/* Content Section */}
        <div className="space-y-6">
          <ChunkSourceEditor
            uploadType={uploadType}
            onUploadTypeChange={setUploadType}
            selectedFile={selectedFile}
            onFileChange={setSelectedFile}
            content={content}
            onContentChange={setContent}
            disabled={isUpdatingContent || isLoading}
            renderFooter={() => (
              <Button
                onClick={handleUpdateContent}
                disabled={isUpdatingContent || isUpdatingMetadata || isLoading}
                variant="primary-action"
              >
                {isUpdatingContent ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t("upload.update_content")}
                  </>
                )}
              </Button>
            )}
          />
        </div>
      </div>
    </div>
  );
}
