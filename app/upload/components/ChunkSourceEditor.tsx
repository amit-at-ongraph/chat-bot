"use client";

import { TextareaWithLineNumbers } from "@/app/components/TextareaWithLineNumbers";
import { Button } from "@/app/components/ui/Button";
import { useTranslation } from "@/app/i18n/useTranslation";
import { cn } from "@/lib/utils";
import { FileText, Type, Upload } from "lucide-react";

interface Props {
  uploadType: "file" | "paste";
  onUploadTypeChange: (type: "file" | "paste") => void;
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  content: string;
  onContentChange: (value: string) => void;
  disabled?: boolean;
  renderFooter?: () => React.ReactNode;
}

export function ChunkSourceEditor({
  uploadType,
  onUploadTypeChange,
  selectedFile,
  onFileChange,
  content,
  onContentChange,
  disabled = false,
  renderFooter,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="border-border-base bg-header-bg space-y-6 rounded-2xl border p-6 shadow-xs">
      <div className="border-border-base flex items-center justify-between border-b pb-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Upload className="h-4 w-4" /> {t("upload.source_content")}
        </h2>
        <div className="bg-app-bg border-border-base flex rounded-lg border p-0.5">
          <button
            onClick={() => onUploadTypeChange("file")}
            disabled={disabled}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              uploadType === "file"
                ? "bg-primary text-white shadow-sm"
                : "text-text-muted hover:text-text-main",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <FileText className="h-3.5 w-3.5" /> {t("upload.file")}
          </button>
          <button
            onClick={() => onUploadTypeChange("paste")}
            disabled={disabled}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              uploadType === "paste"
                ? "bg-primary text-white shadow-sm"
                : "text-text-muted hover:text-text-main",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <Type className="h-3.5 w-3.5" /> {t("upload.paste")}
          </button>
        </div>
      </div>

      {uploadType === "file" ? (
        <div className="space-y-4">
          <div
            className={cn(
              "border-border-base bg-app-bg hover:bg-border-light/50 group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-colors",
              disabled && "pointer-events-none opacity-50",
            )}
          >
            <input
              type="file"
              id="chunk-file"
              className="hidden"
              onChange={(e) => onFileChange(e.target.files?.[0] || null)}
              accept=".pdf,.txt"
              disabled={disabled}
            />
            <label
              htmlFor="chunk-file"
              className={cn("cursor-pointer space-y-4", disabled && "cursor-not-allowed")}
            >
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
                onClick={() => onFileChange(null)}
                className="mt-4 text-[11px] font-medium text-red-500 hover:underline"
                disabled={disabled}
              >
                {t("upload.remove_file")}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <TextareaWithLineNumbers
          value={content}
          onChange={onContentChange}
          placeholder={t("upload.paste_content_placeholder")}
          disabled={disabled}
        />
      )}

      {renderFooter && <div className="pt-4">{renderFooter()}</div>}
    </div>
  );
}
