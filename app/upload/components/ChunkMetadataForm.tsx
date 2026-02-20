"use client";

import { useTranslation } from "@/app/i18n/useTranslation";
import { createOptionsFromEnum } from "@/app/utils/string.utils";
import { EnumSelect } from "@/components/ui/enum-select";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { ApplicableRole } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Database } from "lucide-react";
import { CHUNK_METADATA_FORM_CONFIG, FormFieldConfig } from "../config/chunkMetadataFormConfig";
import { MetadataState } from "../types";

interface Props {
  metadata: MetadataState;
  onChange: <K extends keyof MetadataState>(key: K, value: MetadataState[K]) => void;
  onRoleToggle: (role: ApplicableRole) => void;
  disabled?: boolean;
  renderFooter?: () => React.ReactNode;
}

function renderFormField(
  config: FormFieldConfig,
  metadata: MetadataState,
  onChange: <K extends keyof MetadataState>(key: K, value: MetadataState[K]) => void,
  onRoleToggle: (role: ApplicableRole) => void,
  disabled: boolean,
  t: (key: string) => string,
) {
  const { key, labelKey, placeholderKey, className } = config;

  switch (config.type) {
    case "input": {
      const value = metadata[key] as string;
      return (
        <FormField key={key} label={t(labelKey)}>
          <Input
            type={config.inputType || "text"}
            value={value}
            onChange={(e) => onChange(key, e.target.value as MetadataState[typeof key])}
            placeholder={placeholderKey ? t(placeholderKey) : undefined}
            disabled={disabled}
            className={className}
          />
        </FormField>
      );
    }

    case "enum-select": {
      const value = metadata[key] as string;
      const enumType = config.enumType;
      return (
        <FormField key={key} label={t(labelKey)}>
          <EnumSelect
            value={value}
            onValueChange={(value) => onChange(key, value as MetadataState[typeof key])}
            options={createOptionsFromEnum(enumType)}
            placeholder={placeholderKey ? t(placeholderKey) : undefined}
            disabled={disabled}
            triggerClassName={className}
          />
        </FormField>
      );
    }

    case "role-buttons": {
      const roles = metadata.applicableRoles as ApplicableRole[];
      return (
        <FormField key={key} label={t(labelKey)}>
          <div className="flex flex-wrap gap-2 pt-1">
            {Object.values(config.enumType).map((role) => {
              const isSelected = roles.includes(role);
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => onRoleToggle(role)}
                  disabled={disabled}
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
      );
    }
  }
}

export function ChunkMetadataForm({
  metadata,
  onChange,
  onRoleToggle,
  disabled = false,
  renderFooter,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="border-border-base bg-header-bg space-y-6 rounded-2xl border p-6 shadow-xs">
      <h2 className="border-border-base flex items-center gap-2 border-b pb-4 text-sm font-semibold">
        <Database className="h-4 w-4" /> {t("upload.metadata")}
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {CHUNK_METADATA_FORM_CONFIG.map((config) =>
          renderFormField(config, metadata, onChange, onRoleToggle, disabled, t),
        )}
      </div>

      {renderFooter && <div className="pt-2">{renderFooter()}</div>}
    </div>
  );
}
