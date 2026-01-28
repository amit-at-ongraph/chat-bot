import { UIMessage } from "ai";

export type AppConfig = {
  name: string;
  description: string;
};

export type ExtendedUIMessage = UIMessage & {
  createdAt?: Date | string;
};

export type MessagePart = UIMessage["parts"][number];

export interface ChatAction {
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  prompt: string;
}

export interface DBChat {
  id: string;
  userId: string | null;
  title: string | null;
  createdAt: Date;
}

export interface DBMessage {
  id: string;
  chatId: string;
  role: string;
  content: string;
  createdAt: Date;
}
