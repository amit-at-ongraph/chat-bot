export interface ChatAction {
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface AppConfig {
  name: string;
  description: string;
}

export interface MessagePart {
  type: string;
  text?: string;
}

export interface CustomMessage {
  id: string;
  role: string;
  parts?: MessagePart[];
}
