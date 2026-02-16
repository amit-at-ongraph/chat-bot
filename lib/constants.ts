import { AppConfig, ChatAction } from "@/types/chat";
import {
  AlertCircle,
  BookOpen,
  FileText,
  Home as HomeIcon,
  MessageSquare,
  Scale,
} from "lucide-react";

export const APP_CONFIG: AppConfig = {
  name: "Immigration Action Guide",
  description: "A comprehensive guide and assistant for immigration-related queries and actions.",
};

export const CHAT_ACTIONS: (ChatAction & { id: string })[] = [
  {
    id: "ice_door",
    label: "ICE at my door",
    color: "text-amber-900",
    icon: HomeIcon,
    prompt: "Ice is knocking at my door, what do I do?",
  },
  {
    id: "ice_work",
    label: "ICE at my work",
    color: "text-blue-400",
    icon: BookOpen,
    prompt: "ICE has arrived at my workplace. What are my rights? How should I respond safely?",
  },
  {
    id: "find_legal",
    label: "Find legal help",
    color: "text-amber-600",
    icon: Scale,
    prompt:
      "I need to find legal help for immigration issues. Can you connect me with trusted lawyers and support groups, including free and low-cost options?",
  },
  {
    id: "friend_taken",
    label: "Friend taken by ICE",
    color: "text-red-500",
    icon: AlertCircle,
    prompt:
      "A friend has been taken by ICE. What should I do? How can I find them, support them, and act quickly?",
  },
  {
    id: "protest_prep",
    label: "Protest prep guide",
    color: "text-amber-500",
    icon: MessageSquare,
    prompt:
      "I'm planning to attend a protest. What are my rights? Any tips to stay safe, prepared, and legally protected?",
  },
  {
    id: "ice_warrants",
    label: "About ICE warrants",
    color: "text-red-400",
    icon: FileText,
    prompt:
      "Explain the difference between ICE warrants and judicial warrants. When can ICE legally enter or detain someone?",
  },
];

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

export enum Jurisdiction {
  GLOBAL = "global",
  US_FEDERAL_BASELINE = "US_federal_baseline",
  US_STATE = "US_state",
  EU_UNION = "EU_union",
  UK_NATIONAL = "UK_national",
}

export enum Scenario {
  GLOBAL = "global",
  REGIONAL = "regional",
  LOCAL = "local",
  HOME = "home",
}

export enum LifecycleState {
  ACTIVE = "active",
  INACTIVE = "inactive",
  ARCHIVED = "archived",
  DRAFT = "draft",
}

export enum ApplicableRole {
  GENERAL = "general",
  ADVOCATE = "advocate",
  TARGET = "target",
  EMPLOYER = "employer",
  STAFF = "staff",
  BYSTANDER = "bystander",
}

export type Role = `${ApplicableRole}`;

export const LANGUAGES = [
  { native: "English", english: "English", value: "en" },
  { native: "हिन्दी", english: "Hindi", value: "hi" },
  { native: "Español", english: "Spanish", value: "es" },
  { native: "Français", english: "French", value: "fr" },
  { native: "中文", english: "Chinese", value: "zh" },
  { native: "العربية", english: "Arabic", value: "ar" },
  { native: "Português", english: "Portuguese", value: "pt" },
] as const;
