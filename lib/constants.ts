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

export const CHAT_ACTIONS: ChatAction[] = [
  {
    label: "ICE at my door",
    color: "text-amber-900",
    icon: HomeIcon,
    prompt: "Ice is knocking at my door, what do I do?",
  },
  {
    label: "ICE at my work",
    color: "text-blue-400",
    icon: BookOpen,
    prompt: "ICE has arrived at my workplace. What are my rights? How should I respond safely?",
  },
  {
    label: "Find legal help",
    color: "text-amber-600",
    icon: Scale,
    prompt:
      "I need to find legal help for immigration issues. Can you connect me with trusted lawyers and support groups, including free and low-cost options?",
  },
  {
    label: "Friend taken by ICE",
    color: "text-red-500",
    icon: AlertCircle,
    prompt:
      "A friend has been taken by ICE. What should I do? How can I find them, support them, and act quickly?",
  },
  {
    label: "Protest prep guide",
    color: "text-amber-500",
    icon: MessageSquare,
    prompt:
      "I'm planning to attend a protest. What are my rights? Any tips to stay safe, prepared, and legally protected?",
  },
  {
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

export const LANGUAGES = [
  { label: "English", value: "en" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
  { label: "Hindi", value: "hi" },
  { label: "Chinese", value: "zh" },
  { label: "Arabic", value: "ar" },
];
