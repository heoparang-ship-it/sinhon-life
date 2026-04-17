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

export type HubCategoryId =
  | "wedding"
  | "home"
  | "money"
  | "parenting"
  | "honeymoon"
  | "policy";

export type TabId = "home" | "explore" | "chat" | "my";

export interface HubCategory {
  id: HubCategoryId;
  title: string;
  subtitle: string;
  emoji: string;
  color: "coral" | "mint";
  policyCategories: string[]; // 매핑되는 POLICIES.category
  description: string; // 허브 페이지 상단 설명
}

export type VendorCategoryId = "wedding-hall" | "dress";

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
