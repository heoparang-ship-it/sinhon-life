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

export type VendorCategoryId = "wedding-hall" | "studio" | "dress" | "honeymoon";

export interface Vendor {
  slug: string;
  name: string;
  category: VendorCategoryId;
  categoryLabel: string;
  location: string;
  priceRange: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  description: string;
  highlights: string[];
  contactUrl: string;
}
