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
  },
  {
    label: "ICE at my work",
    color: "text-blue-400",
    icon: BookOpen,
  },
  {
    label: "Find legal help",
    color: "text-amber-600",
    icon: Scale,
  },
  {
    label: "Friend taken by ICE",
    color: "text-red-500",
    icon: AlertCircle,
  },
  {
    label: "Protest prep guide",
    color: "text-amber-500",
    icon: MessageSquare,
  },
  {
    label: "About ICE warrants",
    color: "text-red-400",
    icon: FileText,
  },
];
