export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatBubble {
  id: string;
  text: string;
  isVisible: boolean;
}

export type CategoryId = "housing" | "finance" | "baby" | "tax";

export type MegaCategoryId = "wedding-prep" | "newlywed-life" | "gov-support";

export type TabId = "home" | "chat" | "my";
