import { ApplicableRole, Jurisdiction, LifecycleState, Scenario } from "@/lib/constants";
import { MetadataState } from "../types";

export type FormFieldType = "input" | "enum-select" | "role-buttons";

export interface BaseFormFieldConfig {
  key: keyof MetadataState;
  labelKey: string;
  placeholderKey?: string;
  disabled?: boolean;
  className?: string;
}

export interface InputFieldConfig extends BaseFormFieldConfig {
  type: "input";
  inputType?: "text" | "date" | "email" | "number" | "tel" | "url";
}

export interface EnumSelectFieldConfig extends BaseFormFieldConfig {
  type: "enum-select";
  enumType: typeof Jurisdiction | typeof Scenario | typeof LifecycleState;
}

export interface RoleButtonsFieldConfig extends BaseFormFieldConfig {
  type: "role-buttons";
  enumType: typeof ApplicableRole;
}

export type FormFieldConfig = InputFieldConfig | EnumSelectFieldConfig | RoleButtonsFieldConfig;

/**
 * Configuration array for chunk metadata form fields.
 * This array defines all form fields and can be easily modified to add, remove, or reorder fields.
 */
export const CHUNK_METADATA_FORM_CONFIG: FormFieldConfig[] = [
  {
    type: "input",
    key: "topic",
    labelKey: "upload.topic",
    placeholderKey: "upload.topic_placeholder",
    inputType: "text",
    className: "dark:bg-background bg-white text-[13px]",
  },
  {
    type: "enum-select",
    key: "jurisdiction",
    labelKey: "upload.jurisdiction",
    placeholderKey: "upload.jurisdiction",
    enumType: Jurisdiction,
    className: "w-full text-left text-[13px]",
  },
  {
    type: "enum-select",
    key: "scenario",
    labelKey: "upload.scenario",
    placeholderKey: "upload.scenario",
    enumType: Scenario,
    className: "w-full text-left text-[13px]",
  },
  {
    type: "enum-select",
    key: "lifecycleState",
    labelKey: "upload.status",
    placeholderKey: "upload.status",
    enumType: LifecycleState,
    className: "w-full text-left text-[13px]",
  },
  {
    type: "input",
    key: "lastReviewed",
    labelKey: "upload.last_reviewed",
    inputType: "date",
    className: "dark:bg-background bg-white text-[13px]",
  },
  {
    type: "input",
    key: "lexicalTriggers",
    labelKey: "upload.lexical_triggers",
    placeholderKey: "upload.lexical_triggers_placeholder",
    inputType: "text",
    className: "dark:bg-background bg-white text-[13px]",
  },
  {
    type: "role-buttons",
    key: "applicableRoles",
    labelKey: "upload.applicable_roles",
    enumType: ApplicableRole,
  },
];
